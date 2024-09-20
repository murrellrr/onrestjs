/**
 * @description
 */
export class EventRegistrar {
    /**
     * @description
     * @param {null|Map<string, function({WebEvent}):void>} listeners
     */
    constructor(listeners = null) {
        this._listeners = listeners || new Map();
    }

    /**
     * @description Gets the listens by the event name.
     * @param {string} name
     */
    getListeners(name) {
        let _listeners = this._listeners.get(name);
        return (_listeners)? _listeners : [];
    }

    /**
     * @description
     * @return {Map<string, function(*): *>}
     */
    get listeners() {
        return this._listeners;
    }

    /**
     * @description
     * @param {string} name
     * @param {function({WebEvent}):void} listener
     */
    on(name, listener) {
        if(!this._listeners.has(name))
            this._listeners.set(name, []);
        this._listeners.get(name).push(listener);
    }

    /**
     * @description
     * @param {string} name
     * @param {function({WebEvent}):void} listener
     */
    off(name, listener) {
        if (!this._listeners.has(name)) return;
        const listeners = this._listeners.get(name);
        const index = listeners.indexOf(listener);
        if(index !== -1)
            listeners.splice(index, 1);
    }

    /**
     * @description
     * @param {string} name
     * @param {function({WebEvent}):void} listener
     */
    once(name, listener) {
        const wrapper = async (listener) => {
            await listener(listener);
            this.off(name, wrapper); // Remove the listener after it fires
        };
        this.on(name, wrapper);
    }
}