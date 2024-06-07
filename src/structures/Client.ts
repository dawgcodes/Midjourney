import { GoogleGenerativeAI } from '@google/generative-ai';
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
    public config = config;
    public logger = new Logger();
    public readonly color = config.color;
    public commands = new Collection<string, any>();
    private data: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    public replicate: Replicate | null = null;
    public canvas = new Canvas();
    public genAI: GoogleGenerativeAI | null = null;

    constructor(options: ClientOptions) {
        super(options);
    }

    public async start(token: string): Promise<void> {
        try {
            this.logger.start('Starting bot...');
            this.initReplicate();
            this.initGoogleGenerativeAI();

            await this.loadCommands();
            await this.loadEvents();
            await this.login(token);
        } catch (error) {
            this.logger.error(error);
        }
    }

    private initReplicate(): void {
        if (this.config.replicateToken) {
            this.replicate = new Replicate({ auth: this.config.replicateToken });
            this.logger.info('Replicate is initialized.');
        } else {
            this.logger.warn('Replicate token is missing. Replicate will not be initialized.');
        }
    }

    private initGoogleGenerativeAI(): void {
        if (this.config.geminiKey) {
            this.genAI = new GoogleGenerativeAI(this.config.geminiModel);
            this.logger.info('GoogleGenerativeAI is initialized.');
        } else {
            this.logger.warn('Google key is missing. GoogleGenerativeAI will not be initialized.');
        }
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
                this.on(eventClass.name, (...args: unknown[]) => eventClass.run(...args));
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
