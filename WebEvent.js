import {WebError} from "./WebError.js";

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class EventCanceledError extends WebError {
    constructor(event, reason = null) {
        super("Internal Server Error", 500, reason);
        this._event = event;
    }

    /**
     * @description
     * @return {*}
     */
    get event() {
        return this._event;
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class WebEvent {
    constructor(name, cancelable = false) {
        this._name = name;
        this._cancelable = cancelable;
        this._canceled = false;
        this._reason = null;
    }

    /**
     * @description
     * @return {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @description
     * @return {boolean}
     */
    get cancelable() {
        return this._cancelable
    }

    /**
     * @description
     * @return {boolean}
     */
    get canceled() {
        if(this._cancelable)
            return this._canceled;
        else return false;
    }

    /**
     * @description
     * @return {*}
     */
    get reason() {
        if(this._cancelable)
            return this._reason;
        else return null;
    }

    /**
     * @description
     * @apram {*} [reason]
     */
    cancel(reason = null) {
        if(this._cancelable) {
            this._reason = reason;
            this._canceled = true;
        }
    }

    /**
     * @description
     * @param {string} name
     */
    reset(name) {
        this._name = name;
        this._canceled = false;
    }

    errorOnCanceled() {
        if(this._cancelable && this._canceled)
            throw new EventCanceledError(this._name, this._reason);
    }
}