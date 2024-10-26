import { type ClientOptions, Partials } from "discord.js";
import config from "./config.js";
import Bot from "./structures/Client.js";

const createClientOptions = (): ClientOptions => ({
    intents: 131059,
    allowedMentions: {
        parse: ["users", "roles", "everyone"],
        repliedUser: false,
    },
    partials: [
        Partials.GuildMember,
        Partials.Message,
        Partials.User,
        Partials.ThreadMember,
        Partials.Channel,
        Partials.GuildScheduledEvent,
    ],
});

const setupEventListeners = (client: Bot): void => {
    const { logger } = client;
    process.on("unhandledRejection", (error: Error) => logger.error(error));
    process.on("uncaughtException", (error: Error) => logger.error(error));
    process.on("warning", (warning: Error) => logger.warn(warning));
    process.once("exit", () => logger.warn("Process exited!"));
};

const clientOptions = createClientOptions();
const client = new Bot(clientOptions);

client.start(config.token);
setupEventListeners(client);
