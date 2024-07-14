import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { type Bot, Command, type Context } from "../../structures/index.js";

export default class ConvertCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "convert",
            nameLocalizations: {
                fr: "convertir",
                "es-ES": "convertir",
                de: "konvertieren",
                it: "convertire",
                ja: "変換",
                ko: "변환",
                "zh-CN": "转换",
                ru: "конвертировать",
            },
            description: {
                content: "Converts units of measurement or currencies",
                usage: "convert <amount> <unit/currency> to <unit/currency>",
                examples: ["convert 100 USD to EUR", "convert 5 kilometers to miles"],
            },
            descriptionLocalizations: {
                fr: "Convertit des unités de mesure ou des devises",
                "es-ES": "Convierte unidades de medida o monedas",
                de: "Konvertiert Maßeinheiten oder Währungen",
                it: "Converte unità di misura o valute",
                ja: "単位や通貨を変換します",
                ko: "측정 단위나 통화를 변환합니다",
                "zh-CN": "转换计量单位或货币",
                ru: "Конвертирует единицы измерения или валюты",
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
                    name: "conversion",
                    nameLocalizations: {
                        fr: "conversion",
                        "es-ES": "conversión",
                        de: "umrechnung",
                        it: "conversione",
                        ja: "変換",
                        ko: "변환",
                        "zh-CN": "转换",
                        ru: "конверсия",
                    },
                    description: "The conversion query",
                    descriptionLocalizations: {
                        fr: "La requête de conversion",
                        "es-ES": "La consulta de conversión",
                        de: "Die Umrechnungsanfrage",
                        it: "La richiesta di conversione",
                        ja: "変換クエリ",
                        ko: "변환 쿼리",
                        "zh-CN": "转换查询",
                        ru: "Запрос на конвертацию",
                    },
                    type: 3,
                    required: true,
                },
            ],
        });
    }

    async run(_client: Bot, ctx: Context, args: string[]): Promise<void> {
        const query = args.join(" ");

        if (!query) {
            await ctx.sendMessage({ content: "Please provide a conversion query." });
            return;
        }

        await ctx.sendDeferMessage("Converting...");

        try {
            const conversionResult = await this.convertQuery(query);

            if (!this.isValidConversionResult(conversionResult)) {
                throw new Error("Invalid conversion result.");
            }

            const embed = this.client
                .embed()
                .setTitle("Conversion Result")
                .addFields(
                    { name: "Conversion", value: `\`\`\`${query}\`\`\``, inline: true },
                    { name: "Result", value: `\`\`\`${conversionResult}\`\`\``, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: "Calculation provided by Google Generative AI" });

            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL("https://discord.gg/JeaQTqzsJw"),
            );

            await ctx.editMessage({ embeds: [embed], components: [buttonRow] });
        } catch (error) {
            console.error("Conversion Error:", error);
            await ctx.editMessage({ content: `An error occurred during conversion: ${error.message}` });
        }
    }

    private async convertQuery(query: string): Promise<string> {
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
                                text: `Please convert the following query accurately and provide only the result without any additional text: ${query}`,
                            },
                        ],
                    },
                ],
            })
            .sendMessage("");

        if (!response.response) {
            throw new Error("Conversion AI did not return a response.");
        }

        return response.response.text().trim();
    }

    private isValidConversionResult(result: string): boolean {
        return /\d/.test(result) && result.length < 100;
    }
}
