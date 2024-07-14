import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Translate extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "translate",
            nameLocalizations: {
                fr: "traduire",
                "es-ES": "traducir",
                de: "übersetzen",
                it: "tradurre",
                ja: "翻訳",
                ko: "번역",
                "zh-CN": "翻译",
                ru: "перевести",
            },
            description: {
                content: "Translates text from one language to another",
                usage: "translate <text> <target-language>",
                examples: ["translate Hello world! es"],
            },
            descriptionLocalizations: {
                fr: "Traduit un texte d'une langue à une autre",
                "es-ES": "Traduce texto de un idioma a otro",
                de: "Übersetzt Text von einer Sprache in eine andere",
                it: "Traduce il testo da una lingua all'altra",
                ja: "テキストを他の言語に翻訳します",
                ko: "텍스트를 다른 언어로 번역합니다",
                "zh-CN": "将文本从一种语言翻译成另一种语言",
                ru: "Переводит текст с одного языка на другой",
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
                    name: "text",
                    nameLocalizations: {
                        fr: "texte",
                        "es-ES": "texto",
                        de: "text",
                        it: "testo",
                        ja: "テキスト",
                        ko: "텍스트",
                        "zh-CN": "文本",
                        ru: "текст",
                    },
                    description: "The text to translate",
                    descriptionLocalizations: {
                        fr: "Le texte à traduire",
                        "es-ES": "El texto a traducir",
                        de: "Der zu übersetzende Text",
                        it: "Il testo da tradurre",
                        ja: "翻訳するテキスト",
                        ko: "번역할 텍스트",
                        "zh-CN": "要翻译的文本",
                        ru: "Текст для перевода",
                    },
                    type: 3,
                    required: true,
                },
                {
                    name: "target-language",
                    nameLocalizations: {
                        fr: "langue-cible",
                        "es-ES": "idioma-destino",
                        de: "ziel-sprache",
                        it: "lingua-destinazione",
                        ja: "ターゲット言語",
                        ko: "대상-언어",
                        "zh-CN": "目标语言",
                        ru: "целевой-язык",
                    },
                    description: 'The target language code (e.g., "es" for Spanish)',
                    descriptionLocalizations: {
                        fr: 'Le code de la langue cible (par ex. "es" pour l\'espagnol)',
                        "es-ES": 'El código del idioma destino (ej. "es" para español)',
                        de: 'Der Ziel-Sprachcode (z.B. "es" für Spanisch)',
                        it: 'Il codice della lingua di destinazione (es. "es" per lo spagnolo)',
                        ja: "ターゲット言語コード（例: スペイン語の場合は「es」）",
                        ko: '대상 언어 코드 (예: "es"는 스페인어)',
                        "zh-CN": '目标语言代码（例如，"es" 表示西班牙语）',
                        ru: 'Код целевого языка (например, "es" для испанского)',
                    },
                    type: 3,
                    required: true,
                },
            ],
        });
    }

    async run(client: Bot, ctx: Context, args: string[]): Promise<void> {
        const [text, targetLanguage] = args;

        if (!(text && targetLanguage)) {
            await ctx.sendMessage({ content: "Please provide both the text and the target language." });
            return;
        }

        await ctx.sendDeferMessage("Translating...");

        try {
            const { translatedText, sourceLanguageName } = await this.translateText(text, targetLanguage);
            const targetLanguageName = await this.detectLanguageName(targetLanguage);

            const embed = client
                .embed()
                .setTitle("Translation")
                .addFields(
                    { name: `Original Text - ${sourceLanguageName}`, value: `\`\`\`${text}\`\`\``, inline: true },
                    { name: `Translated Text - ${targetLanguageName}`, value: `\`\`\`${translatedText}\`\`\``, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: "Translation provided by Google Generative AI" });

            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setLabel("Support").setStyle(ButtonStyle.Link).setURL("https://discord.gg/JeaQTqzsJw"),
            );

            await ctx.editMessage({ embeds: [embed], components: [buttonRow] });
        } catch (error) {
            console.error("Translation Error:", error);
            await ctx.editMessage({ content: `An error occurred while translating: ${error.message}` });
        }
    }

    private async translateText(text: string, targetLanguage: string): Promise<{ translatedText: string; sourceLanguageName: string }> {
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
                            { text: `Translate the following text to ${targetLanguage} without adding an example or challenge: ${text}` },
                        ],
                    },
                ],
            })
            .sendMessage(text);

        const translatedText = response.response.text();
        const sourceLanguageName = await this.detectLanguageName(text);

        return { translatedText, sourceLanguageName };
    }

    private async detectLanguageName(text: string): Promise<string> {
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
                                text: `Detect the language of the following text, your answer must contain only one word the language you have detected without any abbreviations: ${text}`,
                            },
                        ],
                    },
                ],
            })
            .sendMessage(text);

        if (!response.response) {
            throw new Error("Language detection API did not return a response.");
        }

        const detectedLanguageName = response.response.text().trim();

        if (!detectedLanguageName) {
            throw new Error("Failed to detect the language.");
        }

        return detectedLanguageName;
    }
}
