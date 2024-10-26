import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Calculate extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "calculate",
            description: {
                content: "cmd.calculate.description",
                usage: "calculate <expression>",
                examples: [
                    "calculate sum of first 100 terms of arithmetic series with first term 1 and common difference 3",
                    "calculate solve for x: x^2 - 5x + 6 = 0",
                ],
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
                    name: "expression",
                    description: "cmd.calculate.options.expression",
                    type: 3,
                    required: true,
                },
            ],
        });
    }

    async run(_client: Bot, ctx: Context, args: string[]): Promise<void> {
        const expression = args.join(" ");

        if (!expression) {
            await ctx.sendMessage({ content: "Please provide a mathematical expression to solve." });
            return;
        }

        await ctx.sendDeferMessage("Calculating...");

        try {
            const result = await this.solveMathExpression(expression);

            if (!this.isValidMathResult(result)) {
                throw new Error("Invalid mathematical result.");
            }

            const embed = this.client
                .embed()
                .setTitle("Calculation Result")
                .addFields(
                    { name: "Expression", value: `\`\`\`${expression}\`\`\``, inline: true },
                    { name: "Result", value: `\`\`\`${result}\`\`\``, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: "Calculation provided by Google Generative AI" });

            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL("https://discord.gg/JeaQTqzsJw"),
            );

            await ctx.editMessage({ embeds: [embed], components: [buttonRow] });
        } catch (error) {
            console.error("Calculation Error:", error);
            await ctx.editMessage({ content: `An error occurred while calculating: ${error.message}` });
        }
    }

    private async solveMathExpression(expression: string): Promise<string> {
        const genAI = new GoogleGenerativeAI(this.client.config.geminiKey);
        const model = genAI.getGenerativeModel({
            model: this.client.config.geminiModel,
            generationConfig: {
                maxOutputTokens: 100,
                temperature: 0.7,
                topK: 1,
                topP: 0.95,
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
                                text: `Solve the following mathematical expression: ${expression}. Provide only the result. Ensure that the result is mathematically accurate and that it solves the given equation.`,
                            },
                        ],
                    },
                ],
            })
            .sendMessage("");

        return response.response.text().trim();
    }

    private isValidMathResult(result: string): boolean {
        return /^[0-9a-zA-Z+\-*/^().= ]+$/.test(result);
    }
}
