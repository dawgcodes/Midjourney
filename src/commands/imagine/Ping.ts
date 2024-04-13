import { CommandInteraction } from "discord.js";
import { Command, Bot } from "../../structures/index.js";


export default class Ping extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'ping',
            description: {
                content: '🏓 | Get the bot latency',
                usage: 'ping',
                examples: [
                    'ping',
                ],
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
    async run(client: Bot, interaction: CommandInteraction) {
        await interaction.deferReply({ fetchReply: true });
        await interaction.editReply({ content: `Pinging...` }).then(async (msg) => {
            const ping = msg.createdTimestamp - interaction.createdTimestamp;
            await interaction.editReply({ content: `Bot Latency: ${ping}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms` });
        });
    }
}