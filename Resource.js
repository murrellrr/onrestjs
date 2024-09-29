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

import {FileNotFoundError, MethodNotAllowedError, WebError} from "./WebError.js";
import {AsyncEventEmitter} from "./AsyncEventEmitter.js";
import {WebEvent} from "./WebEvent.js";
import {Events} from "./Events.js";

/**
 * @description
 * @type {{READ: string, DELETE: string, CREATE: string, PAGE: string, UPDATE: string}}
 */
const ENUM_ENTITY_METHOD = {
    CREATE: "create",
    PAGE:   "page",
    READ:   "read",
    UPDATE: "update",
    DELETE: "delete"
};

/**
 * @description
 * @type {Array<string>}
 * @private
 */
const _DEFAULT_SUPPORTED_FUNCTIONS = [
    ENUM_ENTITY_METHOD.CREATE, ENUM_ENTITY_METHOD.PAGE, ENUM_ENTITY_METHOD.READ, ENUM_ENTITY_METHOD.UPDATE,
    ENUM_ENTITY_METHOD.DELETE
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
 * Extracts the ID for each resource from the URL.
 * @param {string} path - The path template (e.g., /company/employee).
 * @param {string} url - The actual URL (e.g., /company/1234567890/employee/abcdefg).
 * @param {number} [slice]
 * @returns {{resource:(null|string), id: (null|string), remainingUrl: (null|string)}} An object containing the
 *          resource ID and remaining URL or null if no match.
 * @throws {FileNotFoundError}
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
function matchAndExtractIds(path, url, slice = 2) {
    if(path === "/")
        return {
            resource: "/",
            id: null, // Return null if no ID is found
            remainingUrl: url.slice(slice)  // Format remaining URL for further matching
        };

    const urlParts = url.split('/').filter(Boolean);  // Split URL into parts and filter empty strings

    // Ensure the URL starts with the current entity's name
    if(urlParts.length === 0 || urlParts[0] !== path)
        throw new FileNotFoundError(url);
    let _id = (urlParts[1])? urlParts[1].trim() : null;
    if(_id === "" || _id === "%20") _id = null;

    const remainingUrl = urlParts.slice(slice).join('/');  // Remaining URL for child resources or actions

    return {
        resource: urlParts[0],
        id: _id, // Return null if no ID is found
        remainingUrl: remainingUrl ? `/${remainingUrl}` : null  // Format remaining URL for further matching
    };
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
     * @param {null|object} [options]
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(name, options = null, listeners = null) {
        super(listeners);
        this._name = cleanAndFormatName(name);
        this._options = options || {};
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
        //
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<void>}
     */
    async dispatched(context) {
        // do nothing on purpose
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<AbstractResource>}
     */
    async dispatch(context) {
        await this.dispatched(context);
        return null;
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

    async dispatched(context) {
        await this.emit(new NamespaceDispatchedEvent(Events.namespace.On, context, this.name));
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
     * @param {RequestContext} context
     * @param {object} entity
     * @param {string} operation
     * @param {string} name
     */
    constructor(context, entity, operation, name) {
        super("", context, true);
        this._operation = operation;
        this.entity = entity;
    }

    /**
     * @description
     * @returns {string}
     */
    get operation() {
        return this._operation;
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
     * @param {null|object} [options]
     * @param {null|Map<string, EventListener>} [listeners]
     */
    constructor(name, options = null, listeners = null) {
        super(name, options, listeners);

        if(typeof this._options.lazy !== "boolean") this._options.lazy = true;
        if(!this._options.supports) this._options.supports = _DEFAULT_SUPPORTED_FUNCTIONS;

        if(!this._options.supports) this._options.mapping = [
            "create", "page", "read", "update", "delete"
        ];
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
     * @param {string} id
     * @param {object} template
     * @returns {object}
     */
    getInstance(id, template) {
        let _instance = {};
        if(this._options.validate)
            Object.assign(_instance, fromSchema(this._options.schema));
        Object.assign(_instance, template);
        _instance.id = id;
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
     * @param {string} method
     * @returns {boolean} True if the entity operation is supported, false otherwise.
     */
    isSupported(method) {
        return false
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<void>}
     * @private
     */
    async _doReadLifecycle(id, context) {
        // Read and store the entity
        let _instance = this.getInstance(id, this._options.template);
    }

    /**
     * @description
     * @param {string} id
     * @param {RequestContext} context
     * @returns {Promise<object>}
     * @private
     */
    async _doReadProxy(id, context) {
        // Create the proxy.
        return null;
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<void>}
     */
    async dispatched(context) {
        // We are only part of a target, we need to load the entity.
        context.request.addParam(this.name, null);
        if(!this.isSupported(ENUM_ENTITY_METHOD.READ)) return;

        // Generate and either the resource or the proxy.
        let _entity = (this.lazy)? await this._doReadProxy(null, context) :
                                                await this._doReadLifecycle(null, context);

        context.addEntity(this.name, _entity);
    }

    /**
     * @description
     * @param {RequestContext} context
     * @returns {Promise<void>}
     */
    async execute(context) {
        // No we do the lifecycle event that was requested by the HTTP method.
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
     * @returns {Promise<void>}
     */
    async execute(context) {
        //
    }
}