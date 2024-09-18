import {AsyncEventEmitter} from "./AsyncEventEmitter.js";

/**
 *
 * @abstract
 */
export class RequestCommand extends AsyncEventEmitter {
    /**
     * @description
     * @param {RequestContext} context
     * @param {string} name
     * @param {AsyncEventEmitter} asyncEventEmitter
     */
    constructor(context, name, asyncEventEmitter) {
        super(asyncEventEmitter.events);
        this._name = name;
        this._context = context;
    }

    get name() {
        return this._name;
    }

    /**
     * @description
     * @return {RequestContext}
     */
    get context() {
        return this._context;
    }

    /**
     * @return {Promise<void>}
     * @abstract
     */
    async execute() {
        //
    }
}