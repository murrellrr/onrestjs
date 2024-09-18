import {WebError} from "./WebError.js";

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class AbortError extends WebError {
    constructor(event) {
        super("Internal Server Error", 500, event);
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class WebEvent {
    constructor(name) {
        this._name = name;
        this._aborted = false;
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
    get aborted() {
        return this._aborted;
    }

    /**
     * @description
     * @return {*}
     */
    get reason() {
        return this._reason;
    }

    /**
     * @description
     * @apram {*} [reason]
     */
    abort(reason = null) {
        this._reason = reason;
        this._aborted = true;
    }

    /**
     * @description
     * @param name
     */
    reset(name) {
        this._name = name;
        this._aborted = false;
    }
}