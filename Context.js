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

import {WebResponse} from "./WebResponse.js";
import {WebRequest} from "./WebRequest.js";
import {WebError} from "./WebError.js";
import {EntityMap} from "./EntityMap.js";

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class ApplicationContext {
    constructor() {
        this._log = null;
    }

    /**@return{ApplicationLog}*/get log() {return this._log;}
    /**@param{ApplicationLog}log*/set log(log) {this._log = log;}
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class RequestContext {
    /**
     *
     * @param {ApplicationContext} applicationContext
     * @param {InstanceType<http.IncomingMessage>} req
     * @param {InstanceType<http.OutgoingMessage>} res
     */
    constructor(applicationContext, req, res) {
        this._applicationContext = applicationContext;
        this._request = new WebRequest(req);
        this._response = new WebResponse(res);
        this._body = null;
        /**@type{ApplicationLog}*/this._log = null;
        /**@type{EntityMap}*/this._entities = new EntityMap();
        this._failed = false;
    }

    prepare() {
        this._request.prepare();
        this._response.prepare();
        this._log = this._applicationContext.log.child(this._request.url);
    }

    /**
     * @description Checks to see if the request has failed, and if so, throws the reason as the error
     * @throws {WebError} If there was an error during the request.
     */
    errorOnFailure() {
        if(this._failed)
            throw this._reason;
    }

    /**
     * @description
     * @param {*} [reason]
     */
    fail(reason = null) {
        this._failed = true;
        if(reason) this._log.error(reason);
        else this._log.error("Request failed for unknown reason, generating 500 Internal Server Error.");
        this._reason = WebError.fromError(reason);
    }

    /**
     * @description
     * @return {boolean}
     */
    get failed() {
        return this._failed;
    }

    /**
     * @description
     * @return {EntityMap}
     */
    get entity() {
        return this._entities;
    }

    /**
     * @returns{*}
     */
    get body() {
        return this._body;
    }

    /**
     * @return{ApplicationLog}
     */
    get log() {
        return this._log;
    }

    /**
     * @param{ApplicationLog}log
     */
    set log(log) {
        this._log = log;
    }

    /**
     * @returns{ApplicationContext}
     */
    get applicationContext() {
        return this._applicationContext;
    }

    /**
     * @returns{WebRequest}
     */
    get request() {
        return this._request;
    }

    /**
     * @returns{WebResponse}
     */
    get response() {
        return this._response;
    }
}