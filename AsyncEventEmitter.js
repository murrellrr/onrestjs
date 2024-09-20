import {EventRegistrar} from "./EventRegistrar.js";
import {WebError} from "./WebError.js";
import {WebEvent} from "./WebEvent.js";

/**
 *
 */
export class AsyncEventEmitter extends EventRegistrar {
    /**
     *
     * @param {null|Map<string, function(WebEvent):void>} listeners
     */
    constructor(listeners = null) {
        super(listeners);
    }

    /**
     * @description
     * @param {WebEvent} event
     * @param {boolean} [allowCancel]
     * @return {Promise<void>}
     */
    async emit(event, allowCancel = true) {
        if(!event || !(event instanceof WebEvent))
            throw new WebError("Parameter 'event' must be of type WebEvent.");
        if (!this._listeners.has(event.name)) return;

        const listeners = /**@type{function(WebEvent):void}*/[...this._listeners.get(event.name)]; // Create a copy of listeners

        // Sequentially execute each listener
        for(const listener of listeners) {
            await listener(event);
            if(allowCancel && event.cancelable)
                event.errorOnCanceled();
        }
    }
}