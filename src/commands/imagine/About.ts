import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
} from 'discord.js';

import { Bot, Command } from '../../structures/index.js';

export default class About extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'about',
            nameLocalizations: {
                fr: 'about',
            },
            description: {
                content: '📨 | Shows information about the bot',
                usage: 'about',
                examples: ['about'],
            },
            descriptionLocalizations: {
                fr: '📨 | Affiche des informations sur le bot',
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
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite midjourney')
                    .setURL(
                        `https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=8`
                    )
                    .setStyle(ButtonStyle.Link)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/FMGaJcAET8')
                    .setStyle(ButtonStyle.Link)
            );

        const embed = new EmbedBuilder()
            .setAuthor({
                name: 'Midjourney',
                iconURL: 'https://c.clc2l.com/t/M/i/Midjourney-96BXbL.png',
            })
            .setThumbnail('https://c.clc2l.com/t/M/i/Midjourney-96BXbL.png')
            .addFields([
                {
                    name: 'Creator',
                    value: '[LucasB25](https://github.com/dawgcodes)',
                    inline: true,
                },
                {
                    name: 'Repository',
                    value: '[Here](https://github.com/dawgcodes/Midjourney)',
                    inline: true,
                },
                {
                    name: 'Support',
                    value: '[Here](https://discord.gg/FMGaJcAET8)',
                    inline: true,
                },
            ]);
        await interaction.reply({ embeds: [embed], components: [row] });
    }
}
