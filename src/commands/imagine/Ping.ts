import { CommandInteraction } from 'discord.js';

import { Bot, Command } from '../../structures/index.js';

export default class Ping extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'ping',
            nameLocalizations: {
                fr: 'ping',
            },
            description: {
                content: '🏓 | Get the bot latency',
                usage: 'ping',
                examples: ['ping'],
            },
            descriptionLocalizations: {
                fr: '🏓 | Obtiens la latence du bot.',
            },
            category: 'general',
            permissions: {
                dev: false,
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks'],
                user: [],
            },
            cooldown: 3,
            options: [],
        });
    }
    async run(client: Bot, interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply({ fetchReply: true });
        await interaction.editReply({ content: `Pinging...` }).then(async msg => {
            const ping = msg.createdTimestamp - interaction.createdTimestamp;
            await interaction.editReply({
                content: `Bot Latency: ${ping}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms`,
            });
        });
    }
}
