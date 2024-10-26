import { ForumChannel, type ThreadChannel } from "discord.js";
import { type Bot, Event } from "../../structures/index.js";

export default class ThreadCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "threadCreate",
        });
    }

    public async run(thread: ThreadChannel): Promise<void> {
        if (!(thread.parent instanceof ForumChannel)) return;
        if (!this.client.config.allowedForumChannels.includes(thread.parent.id)) return;

        try {
            const tagNames = this.client.config.tagNames;
            const availableTags = thread.parent.availableTags;

            const newTagIds = availableTags.filter((tag) => tagNames.includes(tag.name)).map((tag) => tag.id);

            const combinedTagIds = Array.from(new Set([...thread.appliedTags, ...newTagIds]));

            await thread.setAppliedTags(combinedTagIds);
        } catch (_error) {
            throw new Error(`Error while adding tags to the thread: ${thread.name}`);
        }
    }
}
