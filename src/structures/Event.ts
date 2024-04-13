import { Bot } from "./index.js";

export default class Event {
    public client: Bot;
    public one: boolean;
    public file: string;
    public name: string;
    public fileName: string;
    constructor(client: Bot, file: string, options: EventOptions) {
        this.client = client;
        this.file = file;
        this.name = options.name
        this.one = options.one || false;
        this.fileName = file.split('.')[0];
    }
    public async run(...args: any[]): Promise<void> {
        return Promise.resolve();
    }
}

interface EventOptions {
    name: string;
    one?: boolean;
}