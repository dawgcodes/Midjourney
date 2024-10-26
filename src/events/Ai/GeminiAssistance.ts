import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { ChannelType, type Message, TextChannel, ThreadAutoArchiveDuration } from "discord.js";
import { type Bot, Event } from "../../structures/index.js";

function truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
}

function removeBotMention(text: string, botId: string): string {
    const mention = `<@${botId}>`;
    return text.replace(mention, "").trim();
}

export default class MessageCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "messageCreate",
        });
    }

    public async run(message: Message): Promise<void> {
        if (!(message.channel instanceof TextChannel)) return;

        const botMentioned = message.mentions.has(this.client.user);
        const endsWithPunctuation = /[.!?]$/.test(message.content);

        if (botMentioned && endsWithPunctuation) {
            const cleanContent = removeBotMention(message.content, this.client.user.id);
            const threadName = truncateText(cleanContent, 100);

            const existingThread = message.guild?.channels.cache.find(
                (channel) => channel.name === threadName && channel.type === ChannelType.PublicThread,
            );

            if (existingThread) {
                await message.reply(`The information you are looking for is in the existing thread: ${existingThread}`);
            } else {
                try {
                    const thread = await message.startThread({
                        name: threadName,
                        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
                    });

                    const genAI = new GoogleGenerativeAI(this.client.config.geminiKey);
                    const model = genAI.getGenerativeModel({
                        model: this.client.config.geminiModel,
                        generationConfig: {
                            maxOutputTokens: 1000,
                            temperature: 0.9,
                            topK: 1,
                            topP: 1,
                        },
                        safety_settings: [
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                            {
                                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                            },
                            {
                                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                            },
                        ],
                    } as any);

                    thread.sendTyping();

                    const chat = model.startChat({
                        history: [{ role: "user", parts: [{ text: message.content }] }],
                    });

                    const generatedText = (await chat.sendMessage(message.content)).response.text();

                    let lastIndex = generatedText.lastIndexOf("\n", 1900);
                    if (lastIndex === -1 || lastIndex >= 1900) lastIndex = 1900;

                    const substring = generatedText.substring(0, lastIndex).trim();
                    await thread.send(substring);

                    const remainingText = generatedText.substring(lastIndex).trim();
                    if (remainingText.length > 0) {
                        await thread.send(remainingText);
                    }
                } catch (error) {
                    throw new Error(`An error occurred while generating or sending the response: ${error}`);
                }
            }
        } else if (botMentioned) {
            message.reply("To ask a question, please end your message with punctuation (. ! ?).");
        }
    }
}
