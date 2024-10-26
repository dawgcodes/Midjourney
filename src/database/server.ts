import { PrismaClient, type Guild } from "@prisma/client";
import config from "../config.js";

export default class ServerData {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    public async get(guildId: string): Promise<Guild | null> {
        return (
            (await this.prisma.guild.findUnique({
                where: { guildId },
            })) ?? this.createGuild(guildId)
        );
    }

    private async createGuild(guildId: string): Promise<Guild> {
        return await this.prisma.guild.create({
            data: { guildId },
        });
    }

    public async updateLanguage(guildId: string, language: string): Promise<void> {
        const guild = await this.get(guildId);
        if (guild) {
            await this.prisma.guild.update({
                where: { guildId },
                data: { language },
            });
        } else {
            await this.createGuild(guildId);
            await this.updateLanguage(guildId, language);
        }
    }

    public async getLanguage(guildId: string): Promise<string> {
        const guild = await this.get(guildId);
        return guild?.language ?? config.defaultLanguage;
    }
}
