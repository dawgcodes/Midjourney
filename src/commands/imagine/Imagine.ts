import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
} from 'discord.js';

import { Bot, Command } from '../../structures/index.js';

export default class Imagine extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'imagine',
            nameLocalizations: {
                fr: 'imagine',
            },
            description: {
                content: '📷 | Creates an image from a prompt',
                usage: 'imagine <prompt>',
                examples: ['imagine'],
            },
            descriptionLocalizations: {
                fr: '📷 | Crée une image à partir d\'un prompt',
            },
            category: 'fun',
            cooldown: 3,
            permissions: {
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks', 'AttachFiles'],
                user: ['SendMessages'],
                dev: false,
            },
            options: [
                {
                    name: 'prompt',
                    description: 'The prompt to use',
                    descriptionLocalizations: {
                        fr: 'Le prompt à utiliser',
                    },
                    type: 3,
                    required: true,
                },
                {
                    name: 'negative-prompt',
                    description: 'The negative prompt to use',
                    descriptionLocalizations: {
                        fr: 'Le prompt négatif à utiliser',
                    },
                    type: 3,
                    required: false,
                },
                {
                    name: 'num-outputs',
                    description: 'The number of outputs to generate',
                    descriptionLocalizations: {
                        fr: 'Le nombre de résultats à générer',
                    },
                    type: 4,
                    required: false,
                },
            ],
        });
    }
    async run(client: Bot, interaction: CommandInteraction): Promise<void> {
        const prompt = interaction.options.get('prompt')?.value as string | undefined;
        const negativePrompt = interaction.options.get('negative-prompt')?.value as
            | string
            | undefined;
        const numOutputs =
            (interaction.options.get('num-outputs')?.value as number | undefined) || 4;

        if (!prompt) {
            await interaction.reply({ content: 'Please provide a prompt.', ephemeral: true });
            return;
        }

        await interaction.deferReply({ fetchReply: true });
        await interaction.editReply({ content: `**${prompt}** - ${interaction.user.toString()}` });

        const prediction = (await client.replicate.run(this.client.config.model, {
            input: {
                prompt: prompt,
                num_outputs: numOutputs,
                negative_prompt: negativePrompt,
            },
        })) as any[];

        const rowImg = await client.canvas.mergeImages({
            width: 1000,
            height: 1000,
            images: prediction,
        });

        const attachment = new AttachmentBuilder(rowImg).setName('imagine.png');
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...prediction.map((_, i) =>
                new ButtonBuilder()
                    .setLabel(`${i + 1}`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(prediction[i])
            )
        );

        await interaction.editReply({ files: [attachment], components: [row] });
    }
}
