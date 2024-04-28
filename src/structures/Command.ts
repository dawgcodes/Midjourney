import { ApplicationCommandOption, PermissionResolvable } from 'discord.js';

import { Bot } from './index.js';

interface CommandDescription {
    content: string | null;
    usage: string | null;
    examples: string[] | null;
}

interface CommandOptions {
    name: string;
    nameLocalizations?: any;
    description?: CommandDescription;
    descriptionLocalizations?: any;
    aliases?: string[];
    cooldown?: number;
    args?: boolean;
    player?: {
        voice: boolean;
        dj: boolean;
        active: boolean;
        djPerm: string | null;
    };
    permissions?: {
        dev: boolean;
        client: string[] | PermissionResolvable;
        user: string[] | PermissionResolvable;
    };
    slashCommand?: boolean;
    options?: ApplicationCommandOption[];
    category?: string;
}

export default class Command {
    public client: Bot;
    public name: string;
    public nameLocalizations: any;
    public description: CommandDescription;
    public descriptionLocalizations: any;
    public cooldown: number;
    public permissions: {
        dev: boolean;
        client: string[] | PermissionResolvable;
        user: string[] | PermissionResolvable;
    };
    public options: ApplicationCommandOption[];
    public category: string | null;

    constructor(client: Bot, options: CommandOptions) {
        this.client = client;
        this.name = options.name;
        this.nameLocalizations = options.nameLocalizations || {};
        this.description = {
            content: options.description?.content || 'No description provided',
            usage: options.description?.usage || 'No usage provided',
            examples: options.description?.examples || [''],
        };
        this.descriptionLocalizations = options.descriptionLocalizations || null;
        this.cooldown = options.cooldown || 3;
        this.permissions = {
            dev: options.permissions?.dev || false,
            client: options.permissions?.client || ['SendMessages', 'ViewChannel', 'EmbedLinks'],
            user: options.permissions?.user || [],
        };
        this.options = options.options || [];
        this.category = options.category || 'general';
    }

    public async run(client: Bot, message: any): Promise<any> {
        return await Promise.resolve();
    }
}
