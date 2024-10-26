import { type Bot, Command, type Context } from "../../structures/index.js";
import { type ThreadChannel, ForumChannel, EmbedBuilder } from "discord.js";

export default class CloseThread extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "close-thread",
            description: {
                content: "cmd.closethread.description",
                usage: "close-thread",
                examples: ["close-thread"],
            },
            category: "mod",
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "ManageThreads"],
                user: ["ManageThreads"],
            },
            cooldown: 3,
            options: [],
        });
    }

    async run(_client: Bot, ctx: Context): Promise<void> {
        const thread = ctx.channel as ThreadChannel;

        if (!(thread.parent instanceof ForumChannel)) {
            await ctx.sendMessage({ content: ctx.locale("cmd.closethread.forumchannel") });
            return;
        }

        if (!this.client.config.allowedForumChannels.includes(thread.parent.id)) {
            await ctx.sendMessage({ content: ctx.locale("cmd.closethread.allowedforumchannels") });
            return;
        }

        try {
            const resolvedTag = thread.parent.availableTags.find((tag) => tag.name.toLowerCase() === "resolved");
            if (!resolvedTag) {
                await ctx.sendMessage({ content: ctx.locale("cmd.closethread.resolved") });
                return;
            }

            await thread.setAppliedTags([resolvedTag.id]);

            const embed = new EmbedBuilder()
                .setTitle(ctx.locale("cmd.closethread.embed.title"))
                .setDescription(ctx.locale("cmd.closethread.embed.description", { threadName: thread.name }))
                .setTimestamp();

            await ctx.sendMessage({ embeds: [embed] });

            await thread.setArchived(true);
        } catch (error) {
            console.error(`Error while closing the thread: ${thread.name}`, error);
            const errorEmbed = new EmbedBuilder()
                .setTitle(ctx.locale("cmd.closethread.errorembed.title"))
                .setDescription(ctx.locale("cmd.closethread.errorembed.description", { error: error.message }))
                .setTimestamp();
            await ctx.sendMessage({ embeds: [errorEmbed] });
        }
    }
}
