import {
    ApplicationCommandType,
    Client,
    ClientOptions,
    Collection,
    EmbedBuilder,
    PermissionsBitField,
    REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    Routes,
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Replicate from 'replicate';

import { Canvas } from './Canvas.js';
import Logger from './Logger.js';
import config from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class Bot extends Client {
    public config: typeof config;
    public logger = new Logger();
    public commands = new Collection<string, any>();
    private data: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    public replicate: Replicate | null = null;
    public canvas: Canvas = new Canvas();

    constructor(options: ClientOptions) {
        super(options);
        this.config = config;
    }

    public async start(token: string) {
        this.logger.start('Starting bot...');
        if (!config.replicateToken) {
            this.logger.error('Replicate token is missing.');
            return;
        }
        this.replicate = new Replicate({
            auth: config.replicateToken,
        });
        if (!this.replicate) {
            this.logger.error('Failed to initialize Replicate.');
            return;
        }
        this.logger.info('Replicate is initialized.');

        await this.loadCommands();
        await this.loadEvents();
        await this.login(token);
    }

    public embed(): EmbedBuilder {
        return new EmbedBuilder().setColor(this.config.color as any);
    }

    private async loadEvents(): Promise<void> {
        const events = fs.readdirSync(path.join(__dirname, '../events'));
        for (const event of events) {
            const eventFiles = fs
                .readdirSync(path.join(__dirname, `../events/${event}`))
                .filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const eventFile = (await import(`../events/${event}/${file}`)).default;
                const eventClass = new eventFile(this, file);
                this.on(eventClass.name, (...args: any[]) => eventClass.run(...args));
            }
        }
    }

    private async loadCommands(): Promise<void> {
        const commandsPath = fs.readdirSync(path.join(__dirname, '../commands'));
        for (const commandPath of commandsPath) {
            const commandFiles = fs
                .readdirSync(path.join(__dirname, `../commands/${commandPath}`))
                .filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const commandFile = (await import(`../commands/${commandPath}/${file}`)).default;
                const command = new commandFile(this, file);
                this.commands.set(command.name, command);
                const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
                    name: command.name,
                    description: command.description.content,
                    type: ApplicationCommandType.ChatInput,
                    options: command.options || null,
                    name_localizations: command.nameLocalizations || null,
                    description_localizations: command.descriptionLocalizations || null,
                    default_member_permissions:
                        command.permissions.user.length > 0 ? command.permissions.user : null,
                };
                if (command.permissions.user.length > 0) {
                    const permissionValue = PermissionsBitField.resolve(command.permissions.user);
                    data.default_member_permissions =
                        typeof permissionValue === 'bigint'
                            ? permissionValue.toString()
                            : permissionValue;
                }
                this.data.push(data);
            }
        }

        this.once('ready', async () => {
            const applicationCommands = Routes.applicationCommands(this.config.clientId ?? '');
            try {
                const rest = new REST({ version: '10' }).setToken(this.config.token ?? '');
                await rest.put(applicationCommands, { body: this.data });
                this.logger.info(`Successfully loaded slash commands!`);
            } catch (error) {
                this.logger.error(error);
            }
        });
    }
}
