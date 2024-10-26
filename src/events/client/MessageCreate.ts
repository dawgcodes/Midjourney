import { type Message, TextChannel } from "discord.js";
import { type Bot, Event } from "../../structures/index.js";

export default class MessageCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "messageCreate",
        });
    }

    public async run(message: Message): Promise<void> {
        await this.client.db.get(message.guildId);
        if (message.channel instanceof TextChannel) {
            // Add your logic here if needed
        }
    }
}
