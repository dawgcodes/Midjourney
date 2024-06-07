import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { Bot, Command, Context } from '../../structures/index.js';

export default class Imagine extends Command {
    constructor(client: Bot) {
        super(client, {
            name: 'imagine',
            nameLocalizations: {
                fr: 'imagine',
                'es-ES': 'imagina',
                de: 'vorstellen',
                it: 'immagina',
                ja: '想像する',
                ko: '상상하다',
                'zh-CN': '想象',
                ru: 'представлять',
            },
            description: {
                content: 'Creates an image from a prompt',
                usage: 'imagine <prompt>',
                examples: ['imagine'],
            },
            descriptionLocalizations: {
                fr: 'Crée une image à partir d\'un prompt',
                'es-ES': 'Crea una imagen a partir de un indicio',
                de: 'Erstellt ein Bild aus einem Hinweis',
                it: 'Crea un\'immagine da un prompt',
                ja: 'プロンプトから画像を作成します。',
                ko: '프롬프트에서 이미지를 생성합니다.',
                'zh-CN': '从提示创建图像',
                ru: 'Создает изображение из подсказки',
            },
            category: 'ai',
            cooldown: 3,
            permissions: {
                client: ['SendMessages', 'ViewChannel', 'EmbedLinks', 'AttachFiles'],
                user: ['SendMessages'],
                dev: false,
            },
            options: [
                {
                    name: 'prompt',
                    nameLocalizations: {
                        fr: 'prompt',
                        'es-ES': 'prompt',
                        de: 'prompt',
                        it: 'prompt',
                        ja: 'prompt',
                        ko: '프롬프트',
                        'zh-CN': 'prompt',
                        ru: 'prompt',
                    },
                    description: 'The prompt to use',
                    descriptionLocalizations: {
                        fr: 'Le prompt à utiliser',
                        'es-ES': 'El indicio a utilizar',
                        de: 'Der Hinweis zu verwenden',
                        it: 'Il prompt da utilizzare',
                        ja: '使用するプロンプト',
                        ko: '사용할 프롬프트',
                        'zh-CN': '要使用的提示',
                        ru: 'Подсказка для использования',
                    },
                    type: 3,
                    required: true,
                },
                {
                    name: 'num-outputs',
                    nameLocalizations: {
                        fr: 'num-outputs',
                        'es-ES': 'num-outputs',
                        de: 'num-outputs',
                        it: 'num-outputs',
                        ja: 'num-outputs',
                        ko: '출력 수',
                        'zh-CN': 'num-outputs',
                        ru: 'num-outputs',
                    },
                    description: 'The number of outputs to generate',
                    descriptionLocalizations: {
                        fr: 'Le nombre de résultats à générer',
                        'es-ES': 'El número de salidas a generar',
                        de: 'Die Anzahl der zu generierenden Ausgaben',
                        it: 'Il numero di output da generare',
                        ja: '生成する出力の数',
                        ko: '생성 할 출력 수',
                        'zh-CN': '要生成的输出数量',
                        ru: 'Количество выводов для генерации',
                    },
                    type: 3,
                    choices: [
                        {
                            name: '1',
                            value: '1',
                        },
                        {
                            name: '2',
                            value: '2',
                        },
                        {
                            name: '3',
                            value: '3',
                        },
                        {
                            name: '4',
                            value: '4',
                        },
                    ],
                    required: false,
                },
                {
                    name: 'negative-prompt',
                    nameLocalizations: {
                        fr: 'negative-prompt',
                        'es-ES': 'negative-prompt',
                        de: 'negative-prompt',
                        it: 'negative-prompt',
                        ja: 'negative-prompt',
                        ko: '부정적인프롬프트',
                        'zh-CN': 'negative-prompt',
                        ru: 'negative-prompt',
                    },
                    description: 'The negative prompt to use',
                    descriptionLocalizations: {
                        fr: 'Le prompt négatif à utiliser',
                        'es-ES': 'El indicio negativo a utilizar',
                        de: 'Der negative Hinweis zu verwenden',
                        it: 'Il prompt negativo da utilizzare',
                        ja: '使用するネガティブプロンプト',
                        ko: '사용할 부정적인 프롬프트',
                        'zh-CN': '要使用的负面提示',
                        ru: 'Отрицательная подсказка для использования',
                    },
                    type: 3,
                    required: false,
                },
            ],
        });
    }

    async run(client: Bot, ctx: Context, args: string[]): Promise<void> {
        const prompt = args[0];
        const numOutputsString = args[1];
        const numOutputs = parseInt(numOutputsString || '4', 10);
        const negativePrompt = args[3];

        if (!prompt) {
            await ctx.sendMessage({ content: 'Please provide a prompt.' });
            return;
        }

        await ctx.sendDeferMessage({ fetchReply: true });
        await ctx.editMessage({ content: `**${prompt}** - ${client.user.toString()}` });

        const prediction = (await client.replicate.run(this.client.config.replicateModel, {
            input: {
                prompt: prompt,
                num_outputs: numOutputs,
                negative_prompt: negativePrompt,
            },
        })) as string[];

        const rowImg = await client.canvas.mergeImages({
            width: 1000,
            height: 1000,
            images: prediction,
        });

        const attachment = new AttachmentBuilder(rowImg).setName('imagine.png');

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            ...prediction.map((_, i) =>
                new ButtonBuilder()
                    .setLabel(`${i + 1}`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(prediction[i])
            ),
            new ButtonBuilder()
                .setLabel(`Support`)
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/JeaQTqzsJw')
        );

        await ctx.editMessage({ files: [attachment], components: [buttonRow], ephemeral: false });
    }
}
