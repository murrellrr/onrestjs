

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class AsyncEventEmitter {
    /**
     * @description
     * @param {null|Map<string, function(*):*>} events
     */
    constructor(events = null) {
        this._events = events || new Map();
    }

    /**
     *
     * @return {Map<string, function(*): *>}
     */
    get events() {
        return this._events;
    }

    /**
     * @description
     * @param {string} event
     * @param {function(*):*} listener
     */
    on(event, listener) {
        if(!this._events.has(event))
            this._events.set(event, []);
        this._events.get(event).push(listener);
    }

    /**
     * @description
     * @param {string} event
     * @param {function(*):*} listener
     */
    off(event, listener) {
        if (!this._events.has(event)) return;
        const listeners = this._events.get(event);
        const index = listeners.indexOf(listener);
        if(index !== -1)
            listeners.splice(index, 1);
    }

    /**
     * @description
     * @param {string} event
     * @param {...} args
     * @return {Promise<void>}
     */
    async emit(event, ...args) {
        if(!this._events.has(event)) return;

        const listeners = [...this._events.get(event)]; // Create a copy of listeners

        // Sequentially execute each listener
        for(const listener of listeners) {
            await listener(...args);
        }
    }

    /**
     * @description
     * @param {string} event
     * @param {function(*):*} listener
     */
    once(event, listener) {
        const wrapper = async (...args) => {
            await listener(...args);
            this.off(event, wrapper); // Remove the listener after it fires
        };
        this.on(event, wrapper);
    }
}