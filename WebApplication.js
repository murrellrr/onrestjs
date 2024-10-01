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

import {ApplicationContext, RequestContext} from "./Context.js";
import {ApplicationLog, DefaultConsoleLog} from "./ApplicationLog.js"
import {ApplicationEvent} from "./ApplicationEvent.js"
import {WebEvent} from "./WebEvent.js";
import {FileNotFoundError, WebError} from "./WebError.js";
import {AsyncEventEmitter} from "./AsyncEventEmitter.js";
import {Events} from "./Events.js";
import {AuthenticationEvent} from "./Security.js";
import {AbstractResource, Namespace, Entity, Action} from "./Resource.js";

import http from 'http';

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class WebbApplicationLifecycleEvent extends ApplicationEvent {
    constructor(name, app, cancelable = false) {
        super(name, cancelable);
        this._app = app;
    }

    /**
     * @description
     * @returns {WebApplication}
     */
    get app() {return this._app;}
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class LoadApplicationLogEvent extends WebbApplicationLifecycleEvent {
    constructor(name, app, cancelable = false) {
        super(name, app, cancelable);
        /**@type{ApplicationLog}*/this.log = null;
    }
}

/**
 * @description
 * @extends {AsyncEventEmitter}
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class WebApplication extends AsyncEventEmitter {
    /**
     * @description
     * @param {string} name
     * @param {number} [port]
     */
    constructor(name, port = 3000) {
        super();
        this._name = name;
        this._port = port;
        this._server = null;
        /**@type{Namespace}*/this.rootNamespace = new Namespace("/");
        this._applicationContext = new ApplicationContext();
    }

    /**
     * @description
     * @return {string}
     */
    get resourcePath() {
        return this._path;
    }

    /**
     * @description
     * @return {http.Server}
     */
    get server() {
        return this._server;
    }

    /**
     * @description
     * @returns {ApplicationLog}
     */
    get log() {
        return this._applicationContext.log;
    }

    /**
     * @description
     * @returns {ApplicationContext}
     */
    get context() {
        return this._applicationContext;
    }

    /**
     * Adds a top-level namespace to the root namespace (basePath).
     * @param {string} name - The name of the namespace.
     * @returns {Namespace} The created namespace.
     */
    namespace(name) {
        return this.rootNamespace.namespace(name);
    }

    /**
     * Adds a top-level resource to the root namespace (basePath).
     * @param {string} name - The name of the resource.
     * @returns {Entity} The created resource.
     */
    entity(name) {
        return this.rootNamespace.entity(name);
    }

    /**
     * Joins a resource or namespace to the root namespace (basePath).
     * @param {AbstractResource} entity - The namespace or resource to join.
     * @returns {AbstractResource} The created resource.
     */
    join(entity) {
        return this.rootNamespace.join(entity);
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<void>}
     * @private
     */
    async _doBeforeRequestEvents(context) {
        let _event = new WebEvent(Events.http.request.OnBefore,
            context, true);
        await this.emit(_event);
        await this.emit(_event.reset(`http.request.method.${context.request.method}.before`));
        await this._doAuthenticationEvents(context); // Do the authentication events
        await this.emit(_event.reset(`http.request.method.${context.request.method}`));
    }

    /**
     * @description
     * @param context
     * @returns {Promise<void>}
     * @private
     */
    async _doAfterRequestEvents(context) {
        let _event = new WebEvent(`http.request.method.${context.request.method}.after`,
            context);
        await this.emit(_event);
        await this.emit(_event.reset(Events.http.request.OnAfter));
    }

    /**
     * @description
     * @param context
     * @returns {Promise<void>}
     * @private
     */
    async _doAuthenticationEvents(context) {
        let _event = new AuthenticationEvent(Events.app.auth.authenticate.OnBefore, context);
        await this.emit(_event);
        await this.emit(_event.reset(Events.app.auth.authenticate.On));
        await this.emit(_event.reset(Events.app.auth.authenticate.OnAfter));
    }

    /**
     * @description
     * @param req
     * @param res
     * @return {Promise<RequestContext>}
     * @private
     */
    async _handleRequest(req, res) {
        let _requestContext = new RequestContext(this._applicationContext, req, res);

        _requestContext.prepare();

        try {
            await this._doBeforeRequestEvents(_requestContext);

            let _command = await this.rootNamespace.dispatch(_requestContext);

            if (!_command)
                _requestContext.fail(new FileNotFoundError(req.url));
            else {
                // do after request events
                await this._doAfterRequestEvents(_requestContext);
                // Execute the command
                await _command.execute(_requestContext);
            }
        }
        catch(error) {
            _requestContext.fail(error);
        }
        finally {
            // check to see if we failed, and fail with error.
            _requestContext.errorOnFailure();
        }

        return _requestContext;
    }

    /**
     * @description
     * @param {RequestContext} context
     * @private
     */
     _handleResponse(context) {
        let _response = context.response;
        _response.http.writeHead(_response.code, _response.message, {"Content-Type": "application/json"});
        _response.http.write(JSON.stringify(_response.body, null, 2));
    }

    /**
     * @description
     * @param req
     * @param res
     * @param error
     * @private
     */
    _handleError(req, res, error) {
        this._applicationContext.log.error(error);
        let _error = WebError.fromError(error);
        res.writeHead(_error.code, _error.message, {"Content-Type": "application/json"});
        res.write(JSON.stringify(_error.safe(), null, 2));
    }

    /**
     * @description
     * @return {Promise<void>}
     * @private
     */
    async _start() {
        let _this = this;
        // create the web server
        this._server = http.createServer((req, res) => {
            _this._handleRequest(req, res)
                .then((context) => {
                    _this._handleResponse(context);
                })
                .catch((error) => {
                    _this._handleError(req, res, error);
                })
                .finally(() => {
                    res.end();
                });
        });
        this._server.listen(this._port);
    }

    async _initializeLog() {
        console.log("Initialize application log...");
        let _logEvent =
            new LoadApplicationLogEvent(Events.app.log.initialize.OnBefore, this, true);
        await this.emit(_logEvent);

        _logEvent.reset(Events.app.log.initialize.On);
        await this.emit(_logEvent);

        if(!_logEvent.log) {
            console.log("No application log provided, using default console log.");
            this._applicationContext.log = new DefaultConsoleLog(this._name);
        }

        _logEvent =
            new LoadApplicationLogEvent(Events.app.log.initialize.OnAfter, this, false);
        await this.emit(_logEvent);

        this._applicationContext.log.info("Application log initialized.");
    }

    async _initialize() {
        await this._initializeLog();
    }

    /**
     * @description
     * @return {Promise<void>}
     * @private
     */
    async _doInitialization() {
        console.log("              ______ _____ _____ _____ ");
        console.log("              | ___ \\  ___/  ___|_   _|");
        console.log("  ___  _ __   | |_/ / |__ \\ `--.  | |  ");
        console.log(" / _ \\| '_ \\  |    /|  __| `--. \\ | |  ");
        console.log("| (_) | | | |_| |\\ \\| |___/\\__/ / | |  ");
        console.log(" \\___/|_| |_(_)_| \\_\\____/\\____/  \\_/  ");
        console.log(" ");
        console.log("RESTful action-as-resource, event-based ");
        console.log("       web service framework");
        console.log(" ");
        console.log("Copyright (c) 2024, KRI, llc.");
        console.log("Distributed under MIT license. Happy RESTing!");

        let _event = new WebbApplicationLifecycleEvent(
            Events.app.initialize.OnBefore, this, true);
        await this.emit(_event);
        await this._initialize();
        await this.emit(_event.reset(Events.app.initialize.OnAfter));
    }

    /**
     * @description
     * @param [port]
     * @return {Promise<WebApplication>}
     */
    async start(port = 3000) {
        // Initialize the application
        await this._doInitialization();

        let _event =
            new WebbApplicationLifecycleEvent(Events.app.start.OnBefore, this, true);
        await this.emit(_event);
        await this._start();
        await this.emit(_event.reset(Events.app.start.OnAfter));

        return this;
    }
}