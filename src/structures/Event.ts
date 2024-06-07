import { Bot } from './index.js';

interface EventOptions {
    name: string;
    one?: boolean;
}

export default class Event {
    public client: Bot;
    public one: boolean;
    public file: string;
    public name: string;
    public fileName: string;

    constructor(client: Bot, file: string, { name, one = false }: EventOptions) {
        this.client = client;
        this.file = file;
        this.name = name;
        this.one = one;
        this.fileName = file.split('.')[0];
    }

    public async run(..._args: unknown[]): Promise<void> {
        return await Promise.resolve();
    }
}
