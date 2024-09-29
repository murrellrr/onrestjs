/*
 * Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

import {WebError} from "./WebError.js";
import {ApplicationEvent} from "./ApplicationEvent.js";

/**
 * @typedef {function({ApplicationEvent}):void} EventListener
 * @description The callback function for all on.REST events.
 */

/**
 * @description
 * @param {RegExp} exp
 * @param {import("./AsyncEventEmitter.js").EventListener} listener
 * @returns {import("./AsyncEventEmitter.js").EventListener}
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export function filter(exp, listener) {
    return async (/**@type{ApplicationEvent}*/event) => {
        // perform the regex and then invoke
        if(exp.test(event.name)) await listener(event.name);
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class AsyncEventEmitter {
    /**
     * @description
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(listeners = null) {
        this._listeners = listeners || new Map();
    }

    /**
     * @description
     * @param {ApplicationEvent} event
     * @param {boolean} [allowCancel]
     * @return {Promise<void>}
     */
    async emit(event, allowCancel = true) {
        if(!event || !(event instanceof ApplicationEvent))
            throw new WebError("Parameter 'event' must be of type ApplicationEvent.");
        if (!this._listeners.has(event.name)) return;

        const listeners = /**@type{function(ApplicationEvent):void}*/[...this._listeners.get(event.name)]; // Create a copy of listeners

        // Sequentially execute each listener
        for(const listener of listeners) {
            await listener(event);
            if(allowCancel && event.cancelable)
                event.errorOnCanceled();
        }
    }

    /**
     * @description Gets the listens by the event name.
     * @param {string} name
     * @returns {Array<EventListener>}
     */
    getListeners(name) {
        let _listeners = this._listeners.get(name);
        return (_listeners)? _listeners : [];
    }

    /**
     * @description
     * @return {Map<string, EventListener>}
     */
    get listeners() {
        return this._listeners;
    }

    /**
     * @description
     * @param {string} name
     * @param {EventListener} listener
     * @returns {*}
     */
    on(name, listener) {
        if(!this._listeners.has(name))
            this._listeners.set(name, []);
        this._listeners.get(name).push(listener);
        return this;
    }

    /**
     * @description
     * @param {string} name
     * @param {EventListener} listener
     * @returns {*}
     */
    off(name, listener) {
        if (!this._listeners.has(name)) return;
        const listeners = this._listeners.get(name);
        const index = listeners.indexOf(listener);
        if(index !== -1)
            listeners.splice(index, 1);
        return this;
    }

    /**
     * @description
     * @param {string} name
     * @param {EventListener} listener
     * @returns {*}
     */
    once(name, listener) {
        const wrapper = async (listener) => {
            await listener(listener);
            this.off(name, wrapper); // Remove the listener after it fires
        };
        this.on(name, wrapper);
        return this;
    }
}