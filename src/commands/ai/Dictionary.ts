import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { type Bot, Command, type Context } from "../../structures/index.js";

export default class DictionaryCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "dictionary",
            nameLocalizations: {
                fr: "dictionnaire",
                "es-ES": "diccionario",
                de: "wörterbuch",
                it: "dizionario",
                ja: "辞書",
                ko: "사전",
                "zh-CN": "字典",
                ru: "словарь",
            },
            description: {
                content: "Provides definitions for a given word in a specified language",
                usage: "dictionary <word> [language]",
                examples: ["dictionary altruism", "dictionary altruism fr"],
            },
            descriptionLocalizations: {
                fr: "Fournit des définitions pour un mot donné dans une langue spécifiée",
                "es-ES": "Proporciona definiciones para una palabra dada en un idioma especificado",
                de: "Bietet Definitionen für ein gegebenes Wort in einer angegebenen Sprache",
                it: "Fornisce definizioni per una parola data in una lingua specificata",
                ja: "指定された単語の定義を指定された言語で提供します",
                ko: "주어진 단어의 정의를 지정된 언어로 제공합니다",
                "zh-CN": "提供给定单词在指定语言中的定义",
                ru: "Предоставляет определения для данного слова на указанном языке",
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
                    nameLocalizations: {
                        fr: "mot",
                        "es-ES": "palabra",
                        de: "wort",
                        it: "parola",
                        ja: "単語",
                        ko: "단어",
                        "zh-CN": "词",
                        ru: "слово",
                    },
                    description: "The word to define",
                    descriptionLocalizations: {
                        fr: "Le mot à définir",
                        "es-ES": "La palabra a definir",
                        de: "Das zu definierende Wort",
                        it: "La parola da definire",
                        ja: "定義する単語",
                        ko: "정의할 단어",
                        "zh-CN": "要定义的词",
                        ru: "Слово для определения",
                    },
                    type: 3,
                    required: true,
                },
                {
                    name: "language",
                    nameLocalizations: {
                        fr: "langue",
                        "es-ES": "idioma",
                        de: "sprache",
                        it: "lingua",
                        ja: "言語",
                        ko: "언어",
                        "zh-CN": "语言",
                        ru: "язык",
                    },
                    description: "The language for the definition",
                    descriptionLocalizations: {
                        fr: "La langue pour la définition",
                        "es-ES": "El idioma para la definición",
                        de: "Die Sprache für die Definition",
                        it: "La lingua per la definizione",
                        ja: "定義の言語",
                        ko: "정의의 언어",
                        "zh-CN": "定义的语言",
                        ru: "Язык для определения",
                    },
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

        if (!response.response) {
            throw new Error("Dictionary AI did not return a response.");
        }

        return response.response.text().trim();
    }
}
