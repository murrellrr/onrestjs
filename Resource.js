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

import {BadRequest, FileNotFoundError, MethodNotAllowedError, NotImplementedError, WebError} from "./WebError.js";
import {AsyncEventEmitter} from "./AsyncEventEmitter.js";
import {WebEvent} from "./WebEvent.js";
import {Events} from "./Events.js";
import { createRequire } from "module";
import {EntityMap, EntityResolver} from "./EntityMap.js";

const require = createRequire(import.meta.url); // Create a require function
const fromSchema = require('json-schema-defaults');

/**
 * @typedef {object} ResourceOptions
 * @property {boolean} [lazy]
 * @property {boolean} [validate]
 * @property {null|object} [schema]
 * @property {null|object} [template]
 * @property {Array<Array<string>>|Map<string, string>} [mapping]
 * @property {Array<string>} [supports]
 */

/**
 * @description
 * @type {{READ: string, DELETE: string, CREATE: string, PAGE: string, UPDATE: string}}
 */
const ENUM_ENTITY_METHOD = {
    CREATE:  "create",
    DELETE:  "delete",
    INSPECT: "inspect",
    READ:    "read",
    OPTIONS: "options",
    PAGE:    "page",
    TRACE: "trace",
    UPDATE:  "update"
};

/**
 * @description
 * @type {Array<string>}
 * @private
 */
const _DEFAULT_SUPPORTED_OPERATIONS = [
    ENUM_ENTITY_METHOD.CREATE, ENUM_ENTITY_METHOD.PAGE, ENUM_ENTITY_METHOD.READ, ENUM_ENTITY_METHOD.UPDATE,
    ENUM_ENTITY_METHOD.DELETE, ENUM_ENTITY_METHOD.INSPECT, ENUM_ENTITY_METHOD.OPTIONS, ENUM_ENTITY_METHOD.TRACE
];

/**
 * @description
 * @type {Array<Array<string>>}
 * @private
 */
const _DEFAULT_OPERATIONS_METHODS_MAPPINGS = [
    ["delete",  ENUM_ENTITY_METHOD.DELETE],
    ["get",     ENUM_ENTITY_METHOD.READ],
    ["head",    ENUM_ENTITY_METHOD.INSPECT],
    ["options", ENUM_ENTITY_METHOD.OPTIONS],
    ["patch",   ENUM_ENTITY_METHOD.UPDATE],
    ["post",    ENUM_ENTITY_METHOD.CREATE],
    ["put",     ENUM_ENTITY_METHOD.UPDATE],
    ["trace",   ENUM_ENTITY_METHOD.TRACE],
];

/**
 * @description
 * @param name
 * @returns {string}
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
function cleanAndFormatName(name) {
    // Trim the input
    let formattedString = name.trim();
    if(formattedString !== "/") {
        // Remove all special characters except spaces
        formattedString = formattedString.replace(/[^a-zA-Z0-9 ]/g, "");
        // Replace multiple spaces with a single space
        formattedString = formattedString.replace(/\s+/g, " ");
        // Replace remaining spaces with hyphens
        formattedString = formattedString.replace(/\s/g, "-");

        if (formattedString === "" || formattedString === "-")
            throw WebError.fromError(`Argument 'name' must be a valid string, found '${formattedString}'.`);
    }

    return formattedString;
}

/**
 * @description
 * @abstract
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class AbstractResource extends AsyncEventEmitter {
    static get type() {
        return "AbstractResource";
    }

    /**
     * @decription
     * @param {string} name
     * @param {null|ResourceOptions} [options]
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(name, options = null, listeners = null) {
        super(listeners);
        this._name = cleanAndFormatName(name);
        /**@type{ResourceOptions}}*/this._options = options || {};
    }

    /**
     * @description
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @description
     * @returns {ResourceOptions}
     */
    get options() {
        return this._options;
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<void>}
     * @abstract
     */
    async execute(context) {
        throw new NotImplementedError();
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<AbstractResource>}
     * @abstract
     */
    async dispatched(context) {
        throw new NotImplementedError();
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<AbstractResource>}
     */
    async dispatch(context) {
        if(this.name === context.request.uri.next())
            return await this.dispatched(context);
        else return null;
    }
}

/**
 * @description
 * @abstract
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class ContainerResource extends AbstractResource {
    /**
     * @description
     * @param {string} name
     * @param {null|object} [options]
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(name, options = null, listeners = null) {
        super(name, options, listeners);
        /**@type{Map<string, AbstractResource>}*/this._children = new Map();
    }
    /**
     * @description
     * @returns {Map<string, AbstractResource>}
     */
    get children() {
        return this._children;
    }

    /**
     * @description
     * @param {string} name
     * @returns {AbstractResource}
     */
    getChild(name) {
        return this._children.get(name);
    }

    /**
     * @description
     * @param {AbstractResource} resource
     */
    addChild(resource) {
        let _resource = this._children.get(resource.name);
        if(!_resource)
            this._children.set(resource.name, resource);
        else {
            if(_resource.constructor.type !== resource.constructor.type)
                throw WebError.fromError(`A ${_resource.constructor.type} already exists for name '${resource.name}.`);
        }
        return _resource;
    }

    /**
     * @description
     * @param {string} name
     * @param {object} [options]
     * @returns {Namespace}
     */
    namespace(name, options = null) {
        // Check to see if this is a namespace and we both have "/"
        if(name === "/" && name === this._name)
            throw WebError.fromError("Invalid parameter 'name'. Cannot add '/' namespace to a '/' namespace.");
        let _namespace = new Namespace(name, options);
        this.addChild(_namespace);
        return _namespace;
    }

    /**
     * @description
     * @param {string} name
     * @param {object} [options]
     * @returns {Entity}
     */
    entity(name, options = null) {
        let _entity = new Entity(name, options);
        this.addChild(_entity);
        return _entity;
    }

    /**
     * @description
     * @param {string} name
     * @param {object} [options]
     * @returns {Action}
     */
    action(name, options = null) {
        let _action = new Action(name, options);
        this.addChild(_action);
        return _action;
    }

    /**
     * Joins a resource or namespace to the root namespace (basePath).
     * @param {AbstractResource} resource - The namespace or resource to join.
     * @returns {AbstractResource} The created resource.
     */
    join(resource) {
        this.addChild(resource);
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<AbstractResource>}
     */
    async dispatch(context) {
        let _resource = await super.dispatch(context);

        if(!_resource) {
            let _child = this._children.get(context.request.uri.peek());
            if(_child) _resource = await _child.dispatch(context);
        }

        return _resource;
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class NamespaceDispatchedEvent extends WebEvent {
    constructor(name, context, namespace) {
        super(name, context, true);
        this._namespace = namespace;
    }

    get namespace() {
        return this._namespace;
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class Namespace extends ContainerResource {
    static get type() {
        return "Namespace";
    }

    /**
     * @description
     * @param {string} name
     * @param {null|object} [options]
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(name, options = null, listeners = null) {
        super(name, options, listeners);
    }

    /**
     * @description
     * @param context
     * @returns {Promise<null>}
     */
    async dispatched(context) {
        await this.emit(new NamespaceDispatchedEvent(Events.namespace.On, context, this.name));
        return null;
    }

    /**
     * @throws {FileNotFoundError} as a namespace cannot be a target endpoint
     * @param {RequestContext} context
     * @returns {Promise<void>}
     */
    async execute(context) {
        context.fail(new FileNotFoundError(context.request.url));
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class EntityOperationEvent extends WebEvent {
    /**
     * @description
     * @param {string} event
     * @param {RequestContext} context
     * @param {null|string} id
     * @param {string} name
     * @param {EntityMap} entity
     */
    constructor(event, context, id, name, entity) {
        super(event, context, true);
        /**@type{null|string}*/this._id = id;
        this._name = name;
        /**@type{EntityMap}*/this.entity = entity;
    }

    /**
     * @description
     * @returns {string}
     */
    get id() {
        return this._id;
    }

    /**
     * @description
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @description
     * @returns {object}
     */
    get body() {
        return this._context.body;
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class Entity extends ContainerResource {
    static get type() {
        return "Entity";
    }

    /**
     * @description
     * @param {string} name
     * @param {null|ResourceOptions} [options]
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(name, options = null, listeners = null) {
        super(name, options, listeners);

        if(typeof this._options.lazy !== "boolean") this._options.lazy = true;
        if(!this._options.supports) this._options.supports = _DEFAULT_SUPPORTED_OPERATIONS;
        if(!this._options.mapping) this._options.mapping = _DEFAULT_OPERATIONS_METHODS_MAPPINGS;
        this._options.mapping = new Map(this._options.mapping);
        this._options.schema = this._options.schema || {};
        this._options.validate = !!(this._options.schema);
        this._options.template = this._options.template || {};
    }

    /**
     * @description True if this entity can be lazy loaded, false otherwise. Defaults to false.
     * @returns {boolean}
     */
    get lazy() {
        return this._options.lazy;
    }

    /**
     * @description
     * @returns {boolean}
     */
    get validate() {
        return this._options.validate;
    }

    /**
     * @description
     * @returns {object}
     */
    get schema() {
        return this._options.schema;
    }

    /**
     * @description
     * @returns {object}
     */
    getInstance() {
        let _instance = {};
        if(this._options.validate)
            Object.assign(_instance, fromSchema(this._options.schema));
        if(this._options.template)
            Object.assign(_instance, this._options.template);
        return _instance;
    }

    /**
     * @description
     * @returns {Array<string>}
     */
    get supports() {
        return this._options.supports;
    }

    /**
     * @description
     * @returns {Map<string, string>}
     */
    get mapping() {
        return this._options.mapping;
    }

    /**
     * @description
     * @param {string} method
     * @param {null|string} id
     * @returns {string}
     */
    toOperation(method, id = null) {
        let _operation = /**@type{string}*/this._options.mapping.get(method);
        if(_operation === ENUM_ENTITY_METHOD.READ && !id) _operation = ENUM_ENTITY_METHOD.PAGE;
        return _operation;
    }

    /**
     * @description
     * @param {string} operation
     * @returns {boolean} True if the entity operation is supported, false otherwise.
     */
    isSupported(operation) {
        return this._options.supports.includes(operation);
    }

    async _doEntityLifecycle(operation, id, context) {
        // Read and store the entity
        let _entity = this.getInstance();

        let _event = new EntityOperationEvent(`${operation}.before`, context, id,
            this.name, _entity);
        await this.emit(_event);
        await this.emit(_event.reset(operation));
        context.entity.add(this.name, _event.entity);
        await this.emit(_event.reset(`${operation}.after`));

        return _event.entity;
    }

    async _doPageLifecycle(context) {
        context.log.verbose("Page lifecycle executed.", "Entity", this.name, "_doPageLifecycle");
        return null;
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doReadLifecycle(id, context) {
        context.log.verbose("Read lifecycle executed.", "Entity", this.name, "_doReadLifecycle");
        // Read and store the entity
        return await this._doEntityLifecycle(Events.entity.read.On, id, context);
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doLazyRead(id, context) {
        context.log.verbose("Lazy-read lifecycle executed.", "Entity", this.name, "_doLazyRead");
        const _this = this;
        return new EntityResolver(this.name, async () => {
            return _this._doReadLifecycle(id, context);
        });
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doCreateLifecycle(context) {
        context.log.verbose("Create lifecycle executed.", "Entity", this.name, "_doCreateLifecycle");
        return await this._doEntityLifecycle(Events.entity.create.On, null, context);
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doUpdateLifecycle(id, context) {
        context.log.verbose("Update lifecycle executed.", "Entity", this.name, "_doUpdateLifecycle");
        return await this._doEntityLifecycle(Events.entity.update.On, id, context);
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doDeleteLifecycle(id, context) {
        context.log.verbose("Delete lifecycle executed.", "Entity", this.name, "_doDeleteLifecycle");
        return await this._doEntityLifecycle(Events.entity.delete.On, id, context);
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doInspectLifecycle(id, context) {
        context.log.verbose("Inspect lifecycle executed.", "Entity", this.name, "_doInspectLifecycle");
        return null;
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doTraceLifecycle(id, context) {
        context.log.verbose("Trace lifecycle executed.", "Entity", this.name, "_doTraceLifecycle");
        return null;
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doOptionsLifecycle(id, context) {
        context.log.verbose("Options lifecycle executed.", "Entity", this.name, "_doOptionsLifecycle");
        return null;
    }

    /**
     * @throws A 400 error is the ID is missing for the operation type.
     * @param {null|string} id
     * @param {string} operation
     */
    errorOnRequiredId(id, operation) {
        if(!id && (operation === ENUM_ENTITY_METHOD.READ || operation === ENUM_ENTITY_METHOD.UPDATE ||
                   operation === ENUM_ENTITY_METHOD.DELETE || operation === ENUM_ENTITY_METHOD.INSPECT))
            throw new BadRequest([
                    {
                        attribute: "id",
                        message: `Attribute 'id' required for '${operation}' operation.`,
                        resource: this.name
                    }
                ]);
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<AbstractResource>}
     */
    async dispatched(context) {
        context.log.verbose("Dispatched.", "Entity", this.name, "dispatched");

        // Get our ID, we are a resource
        let _id = context.request.uri.next();
        if(_id) context.request.addParam(this.name, _id); // Add the ID as we are going on to the next resource.

        // Determine if WE are the target.
        if(!context.request.uri.hasNext())
            return this; // We are probably the target, let the execute take over.
        else {
            // Bail out if a page request.
            if (!this.isSupported(ENUM_ENTITY_METHOD.READ)) return null; // Make sure we support full read

            // Generate and either the resource or the proxy.
            let _entity = (this.lazy) ? await this._doLazyRead(_id, context) :
                await this._doReadLifecycle(_id, context);
            context.entity.add(this.name, _entity);

            return null;
        }
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<void>}
     */
    async execute(context) {
        context.log.verbose("Executed.", "Entity", this.name, "execute");

        // No we do the lifecycle event that was requested by the HTTP method.
        let _id = context.request.params.get(this.name);
        let _operation = this.toOperation(context.request.method, _id);
        let _entity = null;
        if(this.isSupported(_operation)) {
            // Determine which operation we are performing.
            this.errorOnRequiredId(_id, _operation);
            switch(_operation) {
                case ENUM_ENTITY_METHOD.READ:
                    _entity = await this._doReadLifecycle(_id, context);
                    break;
                case ENUM_ENTITY_METHOD.PAGE:
                    _entity = await this._doPageLifecycle(context);
                    break;
                case ENUM_ENTITY_METHOD.CREATE:
                    _entity = await this._doCreateLifecycle(context);
                    break;
                case ENUM_ENTITY_METHOD.UPDATE:
                    _entity = await this._doUpdateLifecycle(_id, context);
                    break;
                case ENUM_ENTITY_METHOD.DELETE:
                    _entity = await this._doDeleteLifecycle(_id, context);
                    break;
                case ENUM_ENTITY_METHOD.INSPECT: // HTTP HEAD request
                    await this._doInspectLifecycle(_id, context);
                    break;
                case ENUM_ENTITY_METHOD.OPTIONS: // HTTP OPTIONS request
                    await this._doOptionsLifecycle(_id, context);
                    break;
                case ENUM_ENTITY_METHOD.TRACE:   // HTTP TRACE request
                    await this._doTraceLifecycle(_id, context);
                    break;
                default:
                    context.fail(new MethodNotAllowedError(context.request.method));
            }

            // Send back the entity from the event.
            if(!context.failed) context.response.send(_entity);
        }
        else
            context.fail(new MethodNotAllowedError(context.request.method));
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class Action extends AbstractResource {
    static get type() {
        return "Action";
    }

    /**
     * @description
     * @param {string} name
     * @param {null|object} [options]
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(name, options = null, listeners = null) {
        super(name, listeners);
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<AbstractResource>}
     */
    async dispatched(context) {
        context.log.verbose("Dispatched.", "Action", this.name, "dispatched");
        return this;
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<void>}
     */
    async execute(context) {
        context.log.verbose("Executed.", "Action", this.name, "execute");
    }
}