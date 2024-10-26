import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { type Bot, Command, type Context } from "../../structures/index.js";

export default class About extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "about",
            description: {
                content: "cmd.about.description",
                usage: "about",
                examples: ["about"],
            },
            category: "general",
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks"],
                user: [],
            },
            cooldown: 3,
            options: [],
        });
    }

    async run(_client: Bot, ctx: Context): Promise<void> {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel(ctx.locale("cmd.about.invite", { client: this.client.user?.username }))
                .setURL(
                    `https://discord.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=bot%20applications.commands&permissions=8`,
                )
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder().setLabel(ctx.locale("buttons.support")).setURL("https://discord.gg/JeaQTqzsJw").setStyle(ButtonStyle.Link),
        );

        const embed = this.client
            .embed()
            .setAuthor({ name: "AikouAI" })
            .addFields(
                { name: ctx.locale("cmd.about.creator"), value: "[LucasB25](https://github.com/lucasb25)", inline: true },
                {
                    name: ctx.locale("cmd.about.repository"),
                    value: `[${ctx.locale("words.here")}](https://github.com/lucasb25/AikouAI)`,
                    inline: true,
                },
                {
                    name: ctx.locale("cmd.about.support"),
                    value: `[${ctx.locale("words.here")}](https://discord.gg/AhUJa2kdAr)`,
                    inline: true,
                },
            );

        await ctx.sendMessage({ embeds: [embed], components: [row] });
    }
}
