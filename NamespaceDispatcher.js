import {RequestDispatcher} from "./RequestDispatcher.js";
import {ResourceDispatcher} from "./ResourceDispatcher.js";
import {FileNotFoundError, WebError} from "./WebError.js";

/**
 *
 */
export class NamespaceDispatcher extends RequestDispatcher {
    static SLICE = 1;

    constructor(name, options = null) {
        super(name, options);
        this._resources = [];
        this._namespaces = []; // List of namespaces within this namespace
    }

    addResource(name, contract = null, options = null) {
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
        if(resource instanceof ResourceDispatcher)
            this._resources.push(resource);
        else if(resource instanceof NamespaceDispatcher)
            this._namespaces.push(resource);
        else
            throw new WebError("Argument 'resource' must be a NamespaceDispatcher or ResourceDispatcher.");
        return resource;
    }

    async _doBeforeNamespaceEvents() {
        //
    }

    async _doAfterNamespaceEvents() {
        //
    }

    async _doEvents(context) {
        //
    }

    /**
     * Matches the URL and passes the request to child namespaces or resources.
     * @param {string} url - The request URL.
     * @param {RequestContext} context
     * @return {Promise<RequestCommand>}
     */
    async dispatch(url, context) {
        // Match the URL to the current namespace and extract remaining URL
        const matchResult = NamespaceDispatcher.matchAndExtractNamespaces(this.name, url);

        // Defensive coding
        if(!matchResult.remainingUrl) {
            context.log.error("Incomplete URL resulted in namespace as terminating resource.", "NamespaceDispatcher", "dispatch");
            throw new FileNotFoundError(url);
        }

        // Do my events for this namespace
        await this._doEvents(context);

        // Now try to match the remaining URL with child namespaces or resources
        // Match child namespaces first
        for(const namespace of this._namespaces) {
            const _namespace = await namespace.dispatch(matchResult.remainingUrl, context);
            if(_namespace) return _namespace;
        }

        // Then match child resources
        for(const resource of this._resources) {
            const _resource = await resource.dispatch(matchResult.remainingUrl, context);
            if(_resource) return _resource;
        }

        return null;
    }

    validate() {
        if(this._resources.length === 0 && this._namespaces.length === 0)
            throw new WebError(`Namespace '${this.name}' missing child resources or namespaces.`);
        this._resources.forEach(resource => resource.validate());
        this._namespaces.forEach(namespace => namespace.validate());
    }

    /**
     * Extracts the ID for each resource from the URL.
     * @param {string} path - The path template (e.g., /company/employee).
     * @param {string} url - The actual URL (e.g., /company/1234567890/employee/abcdefg).
     * @returns {{resource:(null|string), id: (null|string), remainingUrl: (null|string)}} An object containing the
     *          resource ID and remaining URL or null if no match.
     * @throws {FileNotFoundError}
     */
    static matchAndExtractNamespaces(path, url) {
        return NamespaceDispatcher.matchAndExtractIds(path, url, NamespaceDispatcher.SLICE);
    }
}