import {WebResponse} from "./WebResponse.js";
import {WebRequest} from "./WebRequest.js";
import {EventQueue} from "./EventQueue.js";
import {WebError} from "./WebError.js";

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
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
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
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
        this._log = null;
        this._events = new EventQueue();
        /**@type{Map<string, object>}*/this._resources = new Map();
        /**@type{RequestCommand}*/this._command = null;
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

    fail(reason = null) {
        this._failed = true;
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
     * @return {RequestCommand}
     */
    get command() {
        return this._command;
    }

    /**
     * @description
     * @param {RequestCommand} cmd
     */
    set command(cmd) {
        this._command = cmd;
    }

    /**
     * @description
     * @return {string|Object}
     */
    get resources() {
        return this._resources;
    }

    /**
     * @description
     * @param {string} name
     * @param {null|object} [defaultValue]
     */
    getResource(name, defaultValue = null) {
        let _resource = this._resources.get(name);
        if(!_resource) return defaultValue;
        else return _resource;
    }

    /**
     * @description
     * @return {EventQueue}
     */
    get eventQueue() {
        return this._events;
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