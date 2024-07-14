import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Calculate extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "calculate",
            nameLocalizations: {
                fr: "calculer",
                "es-ES": "calcular",
                de: "berechnen",
                it: "calcolare",
                ja: "計算",
                ko: "계산",
                "zh-CN": "计算",
                ru: "посчитать",
            },
            description: {
                content: "Solves a mathematical expression",
                usage: "calculate <expression>",
                examples: [
                    "calculate sum of first 100 terms of arithmetic series with first term 1 and common difference 3",
                    "calculate solve for x: x^2 - 5x + 6 = 0",
                ],
            },
            descriptionLocalizations: {
                fr: "Résout une expression mathématique",
                "es-ES": "Resuelve una expresión matemática",
                de: "Löst einen mathematischen Ausdruck",
                it: "Risolve un'espressione matematica",
                ja: "数式を解きます",
                ko: "수학식을 해결합니다",
                "zh-CN": "解决数学表达式",
                ru: "Решает математическое выражение",
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
                    nameLocalizations: {
                        fr: "expression",
                        "es-ES": "expresión",
                        de: "ausdruck",
                        it: "espressione",
                        ja: "数式",
                        ko: "수식",
                        "zh-CN": "表达式",
                        ru: "выражение",
                    },
                    description: "The mathematical expression to solve",
                    descriptionLocalizations: {
                        fr: "L'expression mathématique à résoudre",
                        "es-ES": "La expresión matemática a resolver",
                        de: "Der mathematische Ausdruck, der gelöst werden soll",
                        it: "L'espressione matematica da risolvere",
                        ja: "解く数式",
                        ko: "해결할 수학식",
                        "zh-CN": "要解决的数学表达式",
                        ru: "Математическое выражение для решения",
                    },
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

        if (!response.response) {
            throw new Error("Calculate AI did not return a response.");
        }

        return response.response.text().trim();
    }

    private isValidMathResult(result: string): boolean {
        return /^[0-9a-zA-Z+\-*/^().= ]+$/.test(result);
    }
}
