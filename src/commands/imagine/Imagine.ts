import { CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, AttachmentBuilder } from 'discord.js';
import { Command, Bot } from "../../structures/index.js";


export default class Imagine extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'imagine',
            description: {
                content: '📷 | Creates an image from a prompt',
                usage: 'imagine <prompt>',
                examples: [
                    'imagine',
                ],
            },
            category: 'fun',
            cooldown: 3,
            permissions: {
                client: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles],
                user: [PermissionFlagsBits.SendMessages],
                dev: false
            },
            options: [
                {
                    name: 'prompt',
                    description: 'The prompt to use',
                    type: 3,
                    required: true
                },
                {
                    name: 'negative-prompt',
                    description: 'The negative prompt to use',
                    type: 3,
                    required: false
                },
                {
                    name: 'num-outputs',
                    description: 'The number of outputs to generate',
                    type: 4,
                    required: false
                },
            ]
        });
    }
    async run(client: Bot, interaction: CommandInteraction) {

        const prompt = interaction.options.data[0].value as string;
        await interaction.deferReply({ fetchReply: true });
        await interaction.editReply({ content: `**${prompt}** - ${interaction.user.toString()}` });

        const prediction = await client.replicate.run(this.client.config.model, {
            input: {
                prompt: prompt,
                num_outputs: interaction.options.data[2] ? interaction.options.data[2].value as number : 4,
                negative_prompt: interaction.options.data[1]?.value as string
            },
        }) as string[];
        const rowImg = await client.canvas.mergeImages({
            width: 1000,
            height: 1000,
            images: prediction,
        });
        const attachment = new AttachmentBuilder(rowImg)
            .setName('imagine.png');
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                ...prediction.map((_, i) => new ButtonBuilder()
                    .setLabel(`${i + 1}`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(prediction[i]))
        );
        
        await interaction.editReply({ files: [attachment], components: [row] })
    }
}