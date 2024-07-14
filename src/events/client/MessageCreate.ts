import { type Message, TextChannel } from "discord.js";
import { type Bot, Event } from "../../structures/index.js";

export default class MessageCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "messageCreate",
        });
    }

    // biome-ignore lint/suspicious/useAwait: <explanation>
    public async run(message: Message): Promise<void> {
        if (message.channel instanceof TextChannel) {
            // Add your logic here if needed
        }
    }
}
