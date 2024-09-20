import {ContractDispatcher} from "./ContractDispatcher.js";
import {ActionDispatcher} from "./ActionDispatcher.js";
import {NamespaceDispatcher} from "./NamespaceDispatcher.js";
import {FileNotFoundError, WebError} from "./WebError.js";
import {EventCanceledError, WebEvent} from "./WebEvent.js";
import {RequestEvent} from "./WebApplication.js";
import {RequestCommand} from "./RequestCommand.js";

export class ResourceEvent extends WebEvent {
    constructor(event, resourceName, id, resource) {
        super(event);
        this._resourceName = resourceName;
        this._id = id;
        this._resource = resource;
    }

    get resourceName() {
        return this._resourceName;
    }

    get id() {
        return  this._id;
    }

    get resource() {
        return this._resource;
    }

    set resource(resource) {
        this._resource =  resource;
    }
}

export class ResourceCommand extends RequestCommand {
    async execute() {
       this.context.log.verbose("Enter", "ResourceCommand", "execute");

       this.context.log.verbose("Exit", "ResourceCommand", "execute");
    }
}

/**
 * @class ResourceDispatcher
 * @extends BaseEntity
 */
export class ResourceDispatcher extends ContractDispatcher {
    static SLICE = 2;

    /**
     * @description
     * @param {string} name
     * @param {object} [contract]
     * @param {object} [options]
     */
    constructor(name, contract = null, options = null) {
        super(name, contract, options);
        this._actions = new Map();
        this._resources = [];
        this._namespaces = []; // List of namespaces within the resource
    }

    addAction(name, contract = null, options = null) {
        const action = new ActionDispatcher(name, contract, options);
        this._actions.set(name, action);
        return action;
    }

    addResource(name, contract = null, options = {}) {
        const resource = new ResourceDispatcher(name, contract, options);
        this._resources.push(resource);
        return resource;
    }

    addNamespace(name, options = null) {
        const namespace = new NamespaceDispatcher(name, options);
        this._namespaces.push(namespace);
        return namespace;
    }

    join(resource) {
        if (resource instanceof ResourceDispatcher)
            this._resources.push(resource);
        else if (resource instanceof NamespaceDispatcher)
            this._namespaces.push(resource);
        else if (resource instanceof ActionDispatcher)
            this._actions.set(resource.name, resource);
        else
            throw new WebError("Parameter 'resource' must be an instance of NamespaceDispatcher, ResourceDispatcher, or ActionDispatcher.");
        return resource;
    }

    /**
     * Matches the URL, extracts the resource ID, and passes the request to child namespaces or actions.
     * @param {string} url - The request URL.
     * @param {RequestContext} context
     * @return {Promise<RequestCommand>}
     */
    async dispatch(url, context) {
        // Match the URL to the current resource and extract remaining URL
        const matchResult = ResourceDispatcher.matchAndExtractResources(this.name, url);

        if(!matchResult.remainingUrl)
            return new ResourceCommand(context, this.name);
        else {
            // TODO: we need to load up the instance but take no other action
        }

        // Try to match child namespaces first
        for(const namespace of this._namespaces) {
            const _namespace = await namespace.dispatch(matchResult.remainingUrl, context);
            if(_namespace) return _namespace;
        }

        // Then try to match child resources
        for(const resource of this._resources) {
            const _resource = await resource.dispatch(matchResult.remainingUrl, context);
            if(_resource) return _resource;
        }

        // Finally, try to match actions
        for(const action of this._actions.values()) {
            const _action = await action.dispatch(matchResult.remainingUrl, context);
            if(_action) return _action;
        }

        return null;
    }

    validate() {
        if(this._actions.size === 0 && this._resources.length === 0 && this._namespaces.length === 0)
            throw new Error(`Resource '${this.name}' missing actions, child resources, or namespaces.`);
    }

    /**
     * Extracts the ID for each resource from the URL.
     * @param {string} path - The path template (e.g., /company/employee).
     * @param {string} url - The actual URL (e.g., /company/1234567890/employee/abcdefg).
     * @returns {{resource:(null|string), id: (null|string), remainingUrl: (null|string)}} An object containing the
     *          resource ID and remaining URL or null if no match.
     * @throws {FileNotFoundError}
     */
    static matchAndExtractResources(path, url) {
        return ResourceDispatcher.matchAndExtractIds(path, url, ResourceDispatcher.SLICE);
    }
}