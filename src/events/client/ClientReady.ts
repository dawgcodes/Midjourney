import { Event, Bot, EventsTypes } from '../../structures/index.js';
import { ActivityType } from 'discord.js';

export default class ClientReady extends Event  {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: EventsTypes.ClientReady,
        });
    }
    public async run(): Promise<void> {
        this.client.logger.info(`Connected to Discord as ${this.client.user?.tag}!`);
        
        this.client.user?.setActivity({
            name: '/imagine',
            type: ActivityType.Watching
        });
    }
}