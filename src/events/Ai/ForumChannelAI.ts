import { type Message, ThreadChannel, ForumChannel } from "discord.js";
import { type Bot, Event } from "../../structures/index.js";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export default class MessageCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "messageCreate",
        });
    }

    public async run(message: Message): Promise<void> {
        const summaryKeywords = /\b(resume|résume|résumé|résumés|summar(y|ize|ise|ized|ised|izing|ising|aries))\b/i;
        if (message.mentions.has(this.client.user) && summaryKeywords.test(message.content)) {
            if (
                message.channel instanceof ThreadChannel &&
                message.channel.parent instanceof ForumChannel &&
                this.client.config.allowedForumChannels.includes(message.channel.parent.id)
            ) {
                const threadMessages = await this.fetchThreadMessages(message.channel);
                const threadContent = threadMessages.map((m) => m.content).join("\n");
                const summary = await this.generateSummary(threadContent);
                if (summary) {
                    await message.channel.send(`# Thread Summary: ${summary}`);
                }
            }
        }
    }

    private async fetchThreadMessages(thread: ThreadChannel): Promise<Message[]> {
        const messages: Message[] = [];
        let lastMessageId: string | undefined;

        while (true) {
            const fetchedMessages = await thread.messages.fetch({ limit: 100, before: lastMessageId });
            if (fetchedMessages.size === 0) break;
            messages.push(...fetchedMessages.values());
            lastMessageId = fetchedMessages.last()?.id;
            if (fetchedMessages.size < 100) break;
        }

        return messages;
    }

    private async generateSummary(content: string): Promise<string | null> {
        try {
            const genAI = new GoogleGenerativeAI(this.client.config.geminiKey);
            const model = genAI.getGenerativeModel({
                model: this.client.config.geminiModel,
                generationConfig: {
                    maxOutputTokens: 150,
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
                            parts: [{ text: `Summary of the following discussion: \n\n${content}` }],
                        },
                    ],
                })
                .sendMessage("");

            return response.response.text().trim();
        } catch (error) {
            console.error("Error while generating summary:", error);
            return null;
        }
    }
}
