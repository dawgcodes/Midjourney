import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Invite extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "invite",
            description: {
                content: "cmd.invite.description",
                usage: "invite",
                examples: ["invite"],
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

    async run(client: Bot, ctx: Context): Promise<void> {
        const embed = this.client.embed().setDescription(ctx.locale("cmd.invite.content", { client: client.user?.id }));

        await ctx.sendMessage({ embeds: [embed] });
    }
}
