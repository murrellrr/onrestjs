

/**
 *
 * @abstract
 */
export class RequestCommand {
    /**
     * @description
     * @param {RequestContext} context
     * @param {string} name
     */
    constructor(context, name) {
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
     * @description
     * @param {RequestContext} context
     * @return {Promise<void>}
     */
    async process(context) {
        // TODO: Do a bunch of event stuff.
        await this.execute(context);
    }

    /**
     * @description
     * @param {RequestContext} context
     * @return {Promise<void>}
     * @abstract
     */
    async execute(context) {
        //
    }
}