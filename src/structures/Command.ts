import type { APIApplicationCommandOption, PermissionResolvable } from "discord.js";
import type { Bot } from "./index.js";

interface CommandDescription {
    content: string;
    usage: string;
    examples: string[];
}

interface CommandPermissions {
    dev: boolean;
    client: string[] | PermissionResolvable;
    user: string[] | PermissionResolvable;
}

interface CommandOptions {
    name: string;
    name_localizations?: Record<string, string>;
    description?: CommandDescription;
    description_localizations?: Record<string, string>;
    aliases?: string[];
    cooldown?: number;
    permissions?: CommandPermissions;
    options?: APIApplicationCommandOption[];
    category?: string;
}

export default class Command {
    public client: Bot;
    public name: string;
    public name_localizations: Record<string, string>;
    public description: CommandDescription;
    public description_localizations: Record<string, string> | null;
    public cooldown: number;
    public permissions: CommandPermissions;
    public options: APIApplicationCommandOption[];
    public category: string;

    constructor(client: Bot, options: CommandOptions) {
        this.client = client;
        this.name = options.name;
        this.name_localizations = options.name_localizations || {};
        this.description = {
            content: options.description?.content ?? "No description provided",
            usage: options.description?.usage ?? "No usage provided",
            examples: options.description?.examples ?? ["No examples provided"],
        };
        this.description_localizations = options.description_localizations || {};
        this.cooldown = options.cooldown ?? 3;
        this.permissions = {
            dev: options.permissions?.dev ?? false,
            client: options.permissions?.client ?? ["SendMessages", "ViewChannel", "EmbedLinks"],
            user: options.permissions?.user ?? [],
        };
        this.options = options.options || [];
        this.category = options.category || "general";
    }

    public async run(_client: Bot, _message: any, _args: string[]): Promise<any> {
        return await Promise.resolve();
    }
}
