import { Message, TextChannel } from 'discord.js';

import { Bot, Event } from '../../structures/index.js';

export default class MessageCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: 'messageCreate',
        });
    }

    public async run(message: Message): Promise<void> {
        if (!(message.channel instanceof TextChannel)) {
            return;
        }
    }
}
