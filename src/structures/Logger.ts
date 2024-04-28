import pkg from 'signale';
const { Signale } = pkg;

interface LoggerOptions {
    disabled?: boolean;
    interactive?: boolean;
    logLevel?: string;
    scope?: string;
    types?: {
        info: { badge: string; color: string; label: string };
        warn: { badge: string; color: string; label: string };
        error: { badge: string; color: string; label: string };
        debug: { badge: string; color: string; label: string };
        success: { badge: string; color: string; label: string };
        log: { badge: string; color: string; label: string };
        pause: { badge: string; color: string; label: string };
        start: { badge: string; color: string; label: string };
    };
}

const defaultOptions: LoggerOptions = {
    disabled: false,
    interactive: false,
    logLevel: 'info',
    scope: 'Midjourney',
    types: {
        info: { badge: 'ℹ', color: 'blue', label: 'info' },
        warn: { badge: '⚠', color: 'yellow', label: 'warn' },
        error: { badge: '✖', color: 'red', label: 'error' },
        debug: { badge: '🐛', color: 'magenta', label: 'debug' },
        success: { badge: '✔', color: 'green', label: 'success' },
        log: { badge: '📝', color: 'white', label: 'log' },
        pause: { badge: '⏸', color: 'yellow', label: 'pause' },
        start: { badge: '▶', color: 'green', label: 'start' },
    },
};

export default class Logger extends Signale {
    constructor(options: LoggerOptions = {}) {
        super({ ...defaultOptions, ...options });
    }
}
