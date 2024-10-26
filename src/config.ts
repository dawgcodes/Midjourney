import "dotenv/config";
import { Language } from "./types.js";

export default {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    color: 0x2f3136,
    activity: process.env.ACTIVITY,
    defaultLanguage: process.env.DEFAULT_LANGUAGE || Language.EnglishUS,

    allowedForumChannels: process.env.FORUM_CHANNELS ? JSON.parse(process.env.FORUM_CHANNELS) : [],
    tagNames: process.env.TAGS_NAMES ? JSON.parse(process.env.TAGS_NAMES) : [],

    replicateToken: process.env.REPLICATE_TOKEN,
    replicateModel: process.env.REPLICATE_MODEL as any,

    geminiKey: process.env.GEMINI_KEY,
    geminiModel: process.env.GEMINI_MODEL as any,
};
