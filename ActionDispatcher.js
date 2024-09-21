import {ContractDispatcher} from "./ContractDispatcher.js";
import {RequestCommand} from "./RequestCommand.js";

export class ActionCommand extends RequestCommand {
    /**
     * @description
     * @param {RequestContext} context
     * @param {string} name
     */
    constructor(context, name) {
        super(context, name);
    }

    async execute() {
        this.context.log.verbose("Enter", "ActionCommand", "execute");

        this.context.log.verbose("Exit", "ActionCommand", "execute");
    }
}

/**
 * @class ActionDispatcher
 * @extends BaseEntity
 */
export class ActionDispatcher extends ContractDispatcher {
    constructor(name, contract, options) {
        super(name, contract, options);
    }

    /**
     * @description
     * @param {string} url
     * @param {RequestContext} context
     * @returns {RequestCommand}
     */
    dispatch(url, context) {
        const urlParts = url.split('/').filter(Boolean);  // Split the URL into parts

        // Check if the URL starts with this action's name
        if(urlParts.length === 0 || urlParts[0] !== this.name)
            return null;  // If the action name doesn't match, return null

        return new ActionCommand(context, this.name);
    }

    validate() {
        //
    }
}