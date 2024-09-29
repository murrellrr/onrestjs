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

import {WebEvent} from "./WebEvent.js";
import {Subject} from "./Subject.js";

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class AuthenticationEvent extends WebEvent {
    /**
     * @description
     * @param {string} name
     * @param {RequestContext} context
     * @param {Subject} subject
     */
    constructor(name, context, subject = null) {
        super(name, context, true);
        /**@type{Subject}*/this._subject = subject;
    }

    /**
     * @ description
     * @return {Subject}
     */
    get subject() {
        return this._subject;
    }

    /**
     * @description
     * @param {Subject} sub
     */
    set subject(sub) {
        this._subject = sub
    }
}