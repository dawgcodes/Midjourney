import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Help extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "help",
            nameLocalizations: {
                fr: "aide",
                "es-ES": "ayuda",
                de: "hilfe",
                it: "aiuto",
                ja: "ヘルプ",
                ko: "도움말",
                "zh-CN": "帮助",
                ru: "помощь",
            },
            description: {
                content: "Lists all available commands",
                usage: "help",
                examples: ["help"],
            },
            descriptionLocalizations: {
                fr: "Affiche la liste de toutes les commandes disponibles",
                "es-ES": "Muestra todas las comandos disponibles",
                de: "Zeigt alle verfügbaren Befehle an",
                it: "Mostra tutti i comandi disponibili",
                ja: "すべての利用可能なコマンドを表示します",
                ko: "모든 가능한 명령어를 표시합니다",
                "zh-CN": "列出所有可用的命令",
                ru: "Показывает список всех доступных команд",
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
            commandList += commands.map((cmd) => `\`${cmd.name}\`: ${cmd.description}`).join("\n");
            commandList += "\n";
        });

        const embed = this.client
            .embed()
            .setAuthor({ name: this.client.user?.username })
            .setTitle("Help - List of Commands")
            .setDescription(commandList)
            .setTimestamp();

        await ctx.sendMessage({ embeds: [embed] });
    }
}
