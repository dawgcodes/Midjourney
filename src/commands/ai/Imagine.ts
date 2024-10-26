import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Imagine extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "imagine",
            description: {
                content: "cmd.imagine.description",
                usage: "imagine <prompt>",
                examples: ["imagine"],
            },
            category: "ai",
            cooldown: 3,
            permissions: {
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "AttachFiles"],
                user: ["SendMessages"],
                dev: false,
            },
            options: [
                {
                    name: "prompt",
                    description: "cmd.imagine.options.prompt",
                    type: 3,
                    required: true,
                },
                {
                    name: "num-outputs",
                    description: "cmd.imagine.options.numoutputs",
                    type: 3,
                    choices: [
                        { name: "1", value: "1" },
                        { name: "2", value: "2" },
                        { name: "3", value: "3" },
                        { name: "4", value: "4" },
                    ],
                    required: false,
                },
                {
                    name: "negative-prompt",
                    description: "cmd.imagine.options.negativeprompt",
                    type: 3,
                    required: false,
                },
            ],
        });
    }

    async run(client: Bot, ctx: Context, args: string[]): Promise<void> {
        const prompt = args[0];
        const numOutputs = parseInt(args[1] || "4", 10);
        const negativePrompt = args[2];

        if (!prompt) {
            await ctx.sendMessage({ content: ctx.locale("cmd.imagine.prompt") });
            return;
        }

        await ctx.sendDeferMessage(ctx.locale("cmd.imagine.generating"));
        await ctx.editMessage({ content: `**${prompt}** - ${client.user.toString()}` });

        try {
            const prediction = (await client.replicate.run(client.config.replicateModel, {
                input: { prompt, num_outputs: numOutputs, negative_prompt: negativePrompt },
            })) as string[];

            const rowImg = await client.canvas.mergeImages({
                width: 1000,
                height: 1000,
                images: prediction,
            });

            const attachment = new AttachmentBuilder(rowImg).setName("imagine.png");

            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                ...prediction.map((url, i) =>
                    new ButtonBuilder()
                        .setLabel(`${i + 1}`)
                        .setStyle(ButtonStyle.Link)
                        .setURL(url),
                ),
                new ButtonBuilder()
                    .setLabel(ctx.locale("buttons.support"))
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://discord.gg/JeaQTqzsJw"),
            );

            await ctx.editMessage({ files: [attachment], components: [buttonRow] });
        } catch (error) {
            console.error("Generation Error:", error);
            await ctx.editMessage({ content: `An error occurred during generation: ${error.message}` });
        }
    }
}
