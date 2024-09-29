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

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
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
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class ApplicationEvent {
    static get type() {
        return "ApplicationEvent";
    }

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
        return this;
    }

    errorOnCanceled() {
        if(this._cancelable && this._canceled)
            throw new EventCanceledError(this._name, this._reason);
    }
}