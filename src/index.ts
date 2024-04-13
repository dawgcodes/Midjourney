import { ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import config from './config.js';
import Bot from './structures/Client.js';
const { GuildMembers, MessageContent, GuildVoiceStates, GuildMessages, Guilds, GuildMessageTyping } = GatewayIntentBits;
const clientOptions: ClientOptions = {
    intents: [Guilds, GuildMessages, MessageContent, GuildVoiceStates, GuildMembers, GuildMessageTyping],
    allowedMentions: {
        parse: ['users', 'roles', 'everyone'],
        repliedUser: false,
    },
    partials: [Partials.GuildMember, Partials.Message, Partials.User],
};

const client = new Bot(clientOptions);

client.start(config.token);

process.on('unhandledRejection', (error: Error) => {
    client.logger.error(error);
});

process.on('uncaughtException', (error: Error) => {
    client.logger.error(error);
});

process.on('warning', (warning: Error) => {
    client.logger.warn(warning);
});

process.on('exit', () => {
    client.logger.warn('Process exited!');
});