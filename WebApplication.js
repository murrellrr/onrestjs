import {ApplicationContext, RequestContext} from "./Context.js";
import {ApplicationLog, DefaultConsoleLog} from "./ApplicationLog.js"

import http from 'http';
import {EventCanceledError, WebEvent} from "./WebEvent.js";
import {FileNotFoundError, WebError} from "./WebError.js";
import {AsyncEventEmitter} from "./AsyncEventEmitter.js";
import {NamespaceDispatcher} from "./NamespaceDispatcher.js";
import {Events} from "./Events.js";

export class WebbApplicationLifecycleEvent extends WebEvent {
    constructor(name, app, cancelable = false) {
        super(name, cancelable);
        this._app = app;
    }

    get app() {return this._app;}
}

export class LoadApplicationLogEvent extends WebbApplicationLifecycleEvent {
    constructor(name, app, cancelable = false) {
        super(name, app, cancelable);
        /**@type{ApplicationLog}*/this.log = null;
    }
}

export class RequestEvent extends WebEvent {
    constructor(name, app, context, cancelable = false) {
        super(name, cancelable);
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
     * @returns {ResourceDispatcher} The created resource.
     */
    addResource(name) {
        return this.rootNamespace.addResource(name);
    }

    /**
     * Joins a resource or namespace to the root namespace (basePath).
     * @param {RequestDispatcher} entity - The namespace or resource to join.
     * @returns {RequestDispatcher} The created resource.
     */
    join(entity) {
        return this.rootNamespace.join(entity);
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
     * @private
     */
    _doBeforeRequestEvents(context) {
        let _event = new RequestEvent(Events.http.request.OnBefore, this, context, true);
        context.eventQueue.enqueue(_event);
        _event.reset(`http.request.method.${context.request.method}.before`);
        context.eventQueue.enqueue(_event);
        _event.reset(`http.request.method.${context.request.method}`);
        context.eventQueue.enqueue(_event);
    }

    /**
     * @description
     * @param context
     * @private
     */
    _doAfterRequestEvents(context) {
        let _event =
            new RequestEvent(`http.request.method.${context.request.method}.after`, this, context);
        context.eventQueue.enqueue(_event);
        _event.reset(Events.http.request.OnAfter);
        context.eventQueue.enqueue(_event);
    }

    /**
     * @description
     * @param req
     * @param res
     * @return {RequestContext}
     * @private
     */
    _handleRequest(req, res) {
        let _requestContext = new RequestContext(this._applicationContext, req, res);

        _requestContext.prepare();

        try {
            this._doBeforeRequestEvents(_requestContext);

            _requestContext.command = this.rootNamespace.dispatch(req.url, _requestContext);

            if (!_requestContext.command)
                _requestContext.fail(new FileNotFoundError(req.url));
            else {
                // do after request events
                this._doAfterRequestEvents(_requestContext);
                // Register the listeners
                _requestContext.eventQueue.registerListeners(this);
                // Execute the command
                //await _requestContext.command.process(_requestContext);
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
            try {
                let _requestContext = _this._handleRequest(req, res);
                this._handleResponse(_requestContext);
            }
            catch(error) {
                this._handleError(req, res, error);
            }
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
        _event.reset(Events.app.initialize.OnAfter);
        await this.emit(_event);
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
        _event.reset(Events.app.initialize.OnAfter);
        await this.emit(_event);

        return this;
    }
}