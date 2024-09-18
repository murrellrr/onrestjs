import {WebApplication} from "./WebApplication.js";

export * from "./ActionDispatcher.js";
export * from "./ApplicationLog.js";
export * from "./AsyncEventEmitter.js";
export * from "./Context.js";
export * from "./ContractDispatcher.js";
export * from "./Events.js";
export * from "./NamespaceDispatcher.js";
export * from "./NamespaceDispatcher.js";
export * from "./RequestCommand.js";
export * from "./RequestDispatcher.js";
export * from "./WebApplication.js";
export * from "./WebError.js";
export * from "./WebEvent.js";
export * from "./WebRequest.js";
export * from "./WebResponse.js";

/**
 * @description
 * @param {string} name
 * @param {number} [port]
 * @param {string} [path]
 * @return {WebApplication}
 */
export default (name, port = 3000, path = "/") => {
    return new WebApplication(name, path, port);
}
