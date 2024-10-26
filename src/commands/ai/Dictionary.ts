import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { type Bot, Command, type Context } from "../../structures/index.js";

export default class DictionaryCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "dictionary",
            description: {
                content: "cmd.dictionary.description",
                usage: "dictionary <word> [language]",
                examples: ["dictionary altruism", "dictionary altruism fr"],
            },
            category: "ai",
            cooldown: 3,
            permissions: {
                client: ["SendMessages", "ViewChannel", "EmbedLinks"],
                user: ["SendMessages"],
                dev: false,
            },
            options: [
                {
                    name: "word",
                    description: "cmd.dictionary.options.word",
                    type: 3,
                    required: true,
                },
                {
                    name: "language",
                    description: "cmd.dictionary.options.language",
                    type: 3,
                    required: false,
                },
            ],
        });
    }

    async run(_client: Bot, ctx: Context, args: string[]): Promise<void> {
        const word = args[0];
        const language = args[1] || "en";

        if (!word) {
            await ctx.sendMessage({ content: "Please provide a word to define." });
            return;
        }

        await ctx.sendDeferMessage("Looking up the definition...");

        try {
            const definitionResult = await this.lookupDefinition(word, language);

            if (!definitionResult) {
                throw new Error("Invalid definition result.");
            }

            const embed = this.client
                .embed()
                .setTitle("Dictionary Result")
                .addFields(
                    { name: "Word", value: `\`\`\`${word}\`\`\``, inline: true },
                    { name: "Definition", value: `\`\`\`${definitionResult}\`\`\``, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: "Definition provided by Google Generative AI" });

            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL("https://discord.gg/JeaQTqzsJw"),
            );

            await ctx.editMessage({ embeds: [embed], components: [buttonRow] });
        } catch (error) {
            console.error("Definition Error:", error);
            await ctx.editMessage({ content: `An error occurred during lookup: ${error.message}` });
        }
    }

    private async lookupDefinition(word: string, language: string): Promise<string> {
        const genAI = new GoogleGenerativeAI(this.client.config.geminiKey);
        const model = genAI.getGenerativeModel({
            model: this.client.config.geminiModel,
            generationConfig: {
                maxOutputTokens: 100,
                temperature: 0.9,
                topK: 1,
                topP: 1,
            },
            safety_settings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        } as any);

        const response = await model
            .startChat({
                history: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Define the following word in ${language}: ${word}. Provide only an official text of the word definition without providing other content in the sentence.`,
                            },
                        ],
                    },
                ],
            })
            .sendMessage(word);

        return response.response.text().trim();
    }
}
