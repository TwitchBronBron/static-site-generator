import type { Plugin } from './interfaces';

export type Arguments<T> = [T] extends [(...args: infer U) => any]
    ? U
    : [T] extends [void] ? [] : [T];

export default class PluginManager {
    constructor(
        plugins = [] as Plugin[]
    ) {
        this.plugins.push(...plugins);
    }

    private plugins = [] as Plugin[];

    /**
     * Call `event` on plugins
     */
    public emit<K extends keyof Plugin>(eventName: K, data: Arguments<Plugin[K]>[0]) {
        for (let plugin of this.plugins as any[]) {
            if (plugin[eventName]) {
                plugin[eventName](data);
            }
        }
    }

    /**
     * Emit an event and get the first non-undefined return value.
     * Returning a value from the handler will cancel the rest of the plugin chain.
     */
    public getFirst<K extends keyof Plugin, R>(eventName: K, data: Arguments<Plugin[K]>[0]): R | undefined {
        for (let plugin of this.plugins as any[]) {
            if (plugin[eventName]) {
                const returnValue = plugin[eventName](data);
                if (returnValue !== undefined) {
                    return returnValue;
                }
            }
        }
    }

    /**
     * Add a plugin to the beginning of the list of plugins
     */
    public addFirst(plugin: Plugin) {
        if (!this.has(plugin)) {
            this.plugins.unshift(plugin);
        }
    }

    /**
     * Add a plugin to the end of the list of plugins
     */
    public add(plugin: Plugin) {
        if (!this.has(plugin)) {
            this.plugins.push(plugin);
        }
    }

    public has(plugin: Plugin) {
        return this.plugins.includes(plugin);
    }

    public remove(plugin: Plugin) {
        if (this.has(plugin)) {
            this.plugins.splice(this.plugins.indexOf(plugin));
        }
    }
}
