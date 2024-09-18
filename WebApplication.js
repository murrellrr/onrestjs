import {ApplicationContext, RequestContext} from "./Context.js";
import {ApplicationLog, DefaultConsoleLog} from "./ApplicationLog.js"

import http from 'http';
import {AbortError, WebEvent} from "./WebEvent.js";
import {FileNotFoundError, WebError} from "./WebError.js";
import {AsyncEventEmitter} from "./AsyncEventEmitter.js";
import {NamespaceDispatcher} from "./NamespaceDispatcher.js";

export class WebbApplicationLifecycleEvent extends WebEvent {
    constructor(name, app) {
        super(name);
        this._app = app;
    }

    get app() {return this._app;}
}

export class LoadApplicationLogEvent extends WebbApplicationLifecycleEvent {
    constructor(name, app) {
        super(name, app);
        /**@type{ApplicationLog}*/this.log = null;
    }
}

export class RequestEvent extends WebEvent {
    constructor(name, app, context) {
        super(name);
        this._app = app;
        this._context = context;
    }

    get app() {return this._app;}
    get context() {return this._context;}
}

/**
 * @description
 * @extends {AsyncEventEmitter}
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, KRI LLC. All rights reserved.
 * @licence MIT
 */
export class WebApplication extends AsyncEventEmitter {
    static EVENT_AFTER_INITIALIZE  = "initialize.after";
    static EVENT_BEFORE_INITIALIZE = "initialize.before";
    static EVENT_AFTER_STARTUP     = "startup.after";
    static EVENT_BEFORE_STARTUP    = "startup.before";
    static EVENT_INITIALIZE_LOG    = "initialize.log";

    /**
     * @description
     * @param {string} name
     * @param {string} [path]
     * @param {number} [port]
     */
    constructor(name, path = "/", port = 3000) {
        super();
        this._name = name;
        this._port = port;
        this._server = null;
        this.rootNamespace = new NamespaceDispatcher(path, ''); // Create a root namespace for the basePath
        this._applicationContext = new ApplicationContext();
    }

    /**
     * @description
     * @return {string}
     */
    get resourcePath() {return this._path;}

    /**
     * @description
     * @return {http.Server}
     */
    get server() {return this._server;}

    /**
     * Adds a top-level namespace to the root namespace (basePath).
     * @param {string} name - The name of the namespace.
     * @returns {NamespaceDispatcher} The created namespace.
     */
    addNamespace(name) {
        return this.rootNamespace.addNamespace(name);
    }

    /**
     * Adds a top-level resource to the root namespace (basePath).
     * @param {string} name - The name of the resource.
     * @returns {Resource} The created resource.
     */
    addResource(name) {
        return this.rootNamespace.addResource(name);
    }

    /**
     * Joins a resource or namespace to the root namespace (basePath).
     * @param {BaseEntity} entity - The namespace or resource to join.
     */
    join(entity) {
        this.rootNamespace.join(entity);
    }

    /**
     * @description
     * @param event
     * @param listener
     * @return {WebApplication}
     */
    on(event, listener) {
        super.on(event, listener);
        return this;
    }

    /**
     * @description
     * @param context
     * @return {Promise<void>}
     * @private
     */
    async _doBeforeRequestEvents(context) {
        let _name = `${context.request.method}.before`;
        let _event = new RequestEvent(_name, this, context);
        await this.emit(_event.name, _event);
        if(!_event.aborted) {
            _event.reset(context.request.name);
            await this.emit(_event.name, _event);
        }
        else throw new AbortError(_name);
    }

    /**
     * @description
     * @param context
     * @return {Promise<void>}
     * @private
     */
    async _doAfterRequestEvents(context) {
        let _name = `${context.request.method}.after`;
        let _event = new RequestEvent(_name, this, context);
        await this.emit(_event.name, _event);
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

        try {
            _requestContext.prepare();
            //const url = req.url.replace(this.rootNamespace.name, '').replace(/^\/+/, '');
            await this._doBeforeRequestEvents(_requestContext);
            let _resource = await this.rootNamespace.dispatch(req.url, _requestContext);
            if(!_resource)
                throw new FileNotFoundError(req.url);
            else
                await _resource.execute();
        }
        catch(error) {
            throw error;
        }
        finally {
            // always run after event even if aborted or failed.
            await this._doAfterRequestEvents(_requestContext);
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
        _response.http.end();
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
        res.end();
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
                });
        });
        this._server.listen(this._port);
    }

    async _initializeLog() {
        console.log("Initialize application log...");
        let _logEvent = new LoadApplicationLogEvent(WebApplication.EVENT_INITIALIZE_LOG, this);
        await this.emit(WebApplication.EVENT_INITIALIZE_LOG, _logEvent);

        if(!_logEvent.log) {
            console.log("No application log provided, using default console log.");
            this._applicationContext.log = new DefaultConsoleLog(this._name);
        }

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
        console.log("         RESTful event engine.");
        console.log(" ");
        console.log("Copyright (c) 2024, KRI, llc.");
        console.log("Distributed under MIT license. Happy RESTing!");


        let _event = new WebbApplicationLifecycleEvent(
            WebApplication.EVENT_BEFORE_INITIALIZE, this);
        await this.emit(_event.name, _event);
        if(!_event.aborted) {
            await this._initialize();
            _event.reset(WebApplication.EVENT_AFTER_INITIALIZE);
            await this.emit(_event.name, _event);
        }
        else throw new AbortError(WebApplication.EVENT_BEFORE_INITIALIZE);
    }

    /**
     * @description
     * @param [port]
     * @return {Promise<WebApplication>}
     */
    async start(port = 3000) {
        // Initialize the application
        await this._doInitialization();

        // To the start-up
        await this.emit(WebApplication.EVENT_BEFORE_STARTUP, this);
        await this._start();
        await this.emit(WebApplication.EVENT_AFTER_STARTUP, this);

        return this;
    }
}