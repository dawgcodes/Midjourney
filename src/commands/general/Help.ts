import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Help extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "help",
            description: {
                content: "cmd.help.description",
                usage: "help",
                examples: ["help"],
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
        const categories = new Map<string, { name: string; description: string }[]>();

        client.commands.forEach((cmd) => {
            if (!categories.has(cmd.category)) {
                categories.set(cmd.category, []);
            }
            categories.get(cmd.category)?.push({
                name: cmd.name,
                description: cmd.description.content,
            });
        });

        let commandList = "";
        categories.forEach((commands, category) => {
            commandList += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}**\n`;
            commandList += commands.map((cmd) => `\`${cmd.name}\`: ${ctx.locale(cmd.description)}`).join("\n");
            commandList += "\n";
        });

        const embed = this.client
            .embed()
            .setAuthor({ name: this.client.user?.username })
            .setTitle(ctx.locale("cmd.help.title"))
            .setDescription(commandList)
            .setTimestamp();

        await ctx.sendMessage({ embeds: [embed] });
    }
}
