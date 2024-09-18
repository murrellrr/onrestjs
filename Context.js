import {WebResponse} from "./WebResponse.js";
import {WebRequest} from "./WebRequest.js";

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
    }

    prepare() {
        this._request.prepare();
        this._response.prepare();
        this._log = this._applicationContext.log.child(this._request.url);
    }

    /**@returns{*}*/get body() {return this._body;}

    /**@return{ApplicationLog}*/get log() {return this._log;}
    /**@param{ApplicationLog}log*/set log(log) {this._log = log;}

    /**@returns{ApplicationContext}*/get applicationContext() {return this._applicationContext;}
    /**@returns{WebRequest}*/get request() {return this._request;}
    /**@returns{WebResponse}*/get response() {return this._response;}
}