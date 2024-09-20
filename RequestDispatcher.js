
import {FileNotFoundError} from "./WebError.js";
import {EventRegistrar} from "./EventRegistrar.js";

/**
 * @class BaseEntity
 * @abstract
 * @description Abstract base class for common entities (NamespaceDispatcher, ResourceDispatcher, ActionDispatcher)
 */
export class RequestDispatcher extends EventRegistrar {
    /**
     * @param {string} name - The name of the entity.
     * @param {object} [options]
     */
    constructor(name, options = null) {
        super();
        if(new.target === RequestDispatcher)
            throw new Error("Cannot instantiate abstract class RequestDispatcher directly.");
        this._name = name;
        this._options = options || {};
    }

    /**
     * @description
     * @return {object}
     */
    get options() {
        return this._options;
    }

    /**
     * @description
     * @return {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @abstract
     * @description Match the URL to the entity's path and return the appropriate handler if matched.
     * @param {string} url - The request URL.
     * @param {RequestContext} context
     * @return {Promise<RequestCommand>}
     */
    async dispatch(url, context) {
        throw new Error("Abstract method matchUrl must be implemented by subclasses.");
    }

    /**
     * @abstract
     * @description Validate the entity (e.g., checking for resources or actions).
     * @throws Will throw an error if the entity is invalid.
     */
    validate() {
        throw new Error("Abstract method validate must be implemented by subclasses.");
    }

     /**
      * Extracts the ID for each resource from the URL.
      * @param {string} path - The path template (e.g., /company/employee).
      * @param {string} url - The actual URL (e.g., /company/1234567890/employee/abcdefg).
      * @param {number} [slice]
      * @returns {{resource:(null|string), id: (null|string), remainingUrl: (null|string)}} An object containing the
      *          resource ID and remaining URL or null if no match.
      * @throws {FileNotFoundError}
      */
     static matchAndExtractIds(path, url, slice = 2) {
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

         const remainingUrl = urlParts.slice(slice).join('/');  // Remaining URL for child resources or actions

         return {
             resource: urlParts[0],
             id: urlParts[1] || null, // Return null if no ID is found
             remainingUrl: remainingUrl ? `/${remainingUrl}` : null  // Format remaining URL for further matching
         };
    }
}