import { Bot, Event, EventsTypes } from '../../structures/index.js';

export default class ClientReady extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: EventsTypes.ClientReady,
        });
    }
    public async run(): Promise<void> {
        this.client.logger.info(`Connected to Discord as ${this.client.user?.tag}!`);

        this.client.user?.setActivity({
            name: '/imagine - by dawgcodes',
            type: 1,
        });
    }
}
