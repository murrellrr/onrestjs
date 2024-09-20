import {WebError} from "./WebError.js";
import {WebEvent} from "./WebEvent.js";
import {EventRegistrar} from "./EventRegistrar.js";

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class EventQueue {
    /**
     * @description
     * @param {null|Map<string, Array<WebEvent>>} queue
     */
    constructor(queue = null) {
        /**@type{Map<string, Array<WebEvent>>}*/this._queues = new Map();
        this._listeners = null;
    }

    /**
     * @description
     * @param registrar
     */
    registerListeners(registrar) {
        if(!(registrar instanceof EventRegistrar))
            throw new WebError("Parameter 'registrar' must be an instance of EventRegistrar.");
        for(let _event of this._queues.keys()) {
            // Get all the listeners listening for this event from the registrar
            registrar.getListeners(_event);
        }
    }

    /**
     * @description
     * @param {string} name
     * @return {any}
     */
    getPendingEvents(name) {
        let _events = this._queues.get(name);
        if(!_events) _events = [];
        return _events;
    }


    dequeue(name) {
        //
    }

    /**
     * @description
     * @param {WebEvent} event
     */
    enqueue(event) {
        if(!(event instanceof WebEvent))
            throw new WebError("Parameter 'event' must be an instance of WebEvent.");

        let _events = this._queues.get(event.name);
        if(!_events) {
            _events = [];
            this._queues.set(event.name, _events);
        }
    }
}