import fs from "node:fs";
import path from "node:path";
import { initI18n, T, i18n, localization } from "./I18n.js";
import { fileURLToPath } from "node:url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    ApplicationCommandType,
    Client,
    Collection,
    EmbedBuilder,
    PermissionsBitField,
    REST,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
    Routes,
    Locale,
} from "discord.js";
import Replicate from "replicate";

import config from "../config.js";
import ServerData from "../database/server.js";
import { Canvas } from "./Canvas.js";
import Logger from "./Logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class Bot extends Client {
    public config = config;
    public logger = new Logger();
    public db = new ServerData();
    public readonly color = config.color;
    public commands = new Collection<string, any>();
    private data: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    public replicate: Replicate | null = null;
    public canvas = new Canvas();
    public genAI: GoogleGenerativeAI | null = null;

    public async start(token: string): Promise<void> {
        try {
            this.logger.start("Starting bot...");
            initI18n();
            this.initReplicate();
            this.initGoogleGenerativeAI();

            // await this.deleteCommands();
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
            this.logger.info("Replicate is initialized.");
        } else {
            this.logger.warn("Replicate token is missing. Replicate will not be initialized.");
        }
    }

    private initGoogleGenerativeAI(): void {
        if (this.config.geminiKey) {
            this.genAI = new GoogleGenerativeAI(this.config.geminiModel);
            this.logger.info("GoogleGenerativeAI is initialized.");
        } else {
            this.logger.warn("Google key is missing. GoogleGenerativeAI will not be initialized.");
        }
    }

    public embed(): EmbedBuilder {
        return new EmbedBuilder().setColor(this.config.color);
    }

    private async loadEvents(): Promise<void> {
        const eventsPath = path.join(__dirname, "../events");
        const events = fs.readdirSync(eventsPath);
        for (const event of events) {
            const eventFilesPath = path.join(eventsPath, event);
            const eventFiles = fs.readdirSync(eventFilesPath).filter((file) => file.endsWith(".js"));
            for (const file of eventFiles) {
                const eventFile = (await import(`../events/${event}/${file}`)).default;
                const eventClass = new eventFile(this, file);
                this.on(eventClass.name, (...args: unknown[]) => eventClass.run(...args));
            }
        }
    }

    private async loadCommands(): Promise<void> {
        const commandsPath = path.join(__dirname, "../commands");
        const commandCategories = fs.readdirSync(commandsPath);
        for (const category of commandCategories) {
            const commandFilesPath = path.join(commandsPath, category);
            const commandFiles = fs.readdirSync(commandFilesPath).filter((file) => file.endsWith(".js"));
            for (const file of commandFiles) {
                const commandFile = (await import(`../commands/${category}/${file}`)).default;
                const command = new commandFile(this, file);
                this.commands.set(command.name, command);

                const data: RESTPostAPIChatInputApplicationCommandsJSONBody = {
                    name: command.name,
                    description: T(Locale.EnglishUS, command.description.content),
                    type: ApplicationCommandType.ChatInput,
                    options: command.options || [],
                    default_member_permissions:
                        Array.isArray(command.permissions.user) && command.permissions.user.length > 0
                            ? PermissionsBitField.resolve(command.permissions.user as any).toString()
                            : null,
                    name_localizations: null,
                    description_localizations: null,
                };
                // command description and name localizations
                const localizations = [];
                i18n.getLocales().map((locale) => {
                    localizations.push(localization(locale, command.name, command.description.content));
                });
                for (const localization of localizations) {
                    const [language, name] = localization.name;
                    const [language2, description] = localization.description;
                    data.name_localizations = { ...data.name_localizations, [language]: name };
                    data.description_localizations = { ...data.description_localizations, [language2]: description };
                }

                // command options localizations
                if (command.options.length > 0) {
                    command.options.map((option) => {
                        // command options name and description localizations
                        const optionsLocalizations = [];
                        i18n.getLocales().map((locale) => {
                            optionsLocalizations.push(localization(locale, option.name, option.description));
                        });
                        for (const localization of optionsLocalizations) {
                            const [language, name] = localization.name;
                            const [language2, description] = localization.description;
                            option.name_localizations = { ...option.name_localizations, [language]: name };
                            option.description_localizations = { ...option.description_localizations, [language2]: description };
                        }
                        // command options description localization
                        option.description = T(Locale.EnglishUS, option.description);
                    });
                }
                this.data.push(data);
            }
        }

        this.once("ready", async () => {
            const applicationCommands = Routes.applicationCommands(this.config.clientId ?? "");
            try {
                const rest = new REST({ version: "10" }).setToken(this.config.token ?? "");
                await rest.put(applicationCommands, { body: this.data });
                this.logger.info("Successfully loaded slash commands!");
            } catch (error) {
                this.logger.error(error);
            }
        });
    }

    // New method to delete existing slash commands
    private async deleteCommands(): Promise<void> {
        const rest = new REST({ version: "10" }).setToken(this.config.token ?? "");
        const applicationCommands = Routes.applicationCommands(this.config.clientId ?? "");
        try {
            const existingCommands = (await rest.get(applicationCommands)) as any[];
            for (const command of existingCommands) {
                await rest.delete(Routes.applicationCommand(this.config.clientId ?? "", command.id));
                this.logger.info(`Deleted command: ${command.name}`);
            }
            this.logger.info("Successfully deleted all existing slash commands.");
        } catch (error) {
            this.logger.error("Failed to delete slash commands:", error);
        }
    }
}
