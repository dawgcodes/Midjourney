import { type Bot, Command, type Context } from "../../structures/index.js";

export default class Invite extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "invite",
            nameLocalizations: {
                fr: "invite",
                "es-ES": "invitar",
                de: "einladen",
                it: "invita",
                ja: "招待",
                ko: "초대",
                "zh-CN": "邀请",
                ru: "пригласить",
            },
            description: {
                content: "Get the bot invite link",
                usage: "invite",
                examples: ["invite"],
            },
            descriptionLocalizations: {
                fr: "Afficher le lien d'invitation.",
                "es-ES": "Obtén el enlace de invitación del bot",
                de: "Erhalte den Einladungslink des Bots",
                it: "Ottieni il link di invito del bot",
                ja: "ボットの招待リンクを取得します。",
                ko: "봇 초대 링크 가져오기",
                "zh-CN": "获取机器人邀请链接",
                ru: "Получить ссылку на приглашение бота",
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
        const embed = this.client
            .embed()
            .setDescription(
                `Invite me to your server with this link: [Invite](https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=8)`,
            );

        await ctx.sendMessage({ embeds: [embed] });
    }
}
