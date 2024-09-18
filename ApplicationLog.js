/**
 * @avstract
 */
export class ApplicationLog {
    constructor() {}

    /**
     * @description
     * @param {string} message
     * @param {...} [args]
     * @return {void}
     * @abstract
     */
    silly(message, ...args) {
        throw new Error("Not Implemented.");
    }

    /**
     * @description
     * @param {string} message
     * @param {...} [args]
     * @return {void}
     * @abstract
     */
    debug(message, ...args) {
        throw new Error("Not Implemented.");
    }

    /**
     * @description
     * @param {string} message
     * @param {...} [args]
     * @return {void}
     * @abstract
     */
    verbose(message, ...args) {
        throw new Error("Not Implemented.");
    }

    /**
     * @description
     * @param {string} message
     * @param {...} [args]
     * @return {void}
     * @abstract
     */
    info(message, ...args) {
        throw new Error("Not Implemented.");
    }

    /**
     * @description
     * @param {string} message
     * @param {...} [args]
     * @return {void}
     * @abstract
     */
    warn(message, ...args) {
        throw new Error("Not Implemented.");
    }

    /**
     * @description
     * @param {string} message
     * @param {...} [args]
     * @return {void}
     * @abstract
     */
    error(message, ...args) {
        throw new Error("Not Implemented.");
    }

    /**
     * @description
     * @param {string} message
     * @param {...} [args]
     * @return {void}
     * @abstract
     */
    threat(message, ...args) {
        throw new Error("Not Implemented.");
    }

    /**
     *
     * @param {string} name
     * @param {Object} [metaData]
     * @return {ApplicationLog}
     * @abstract
     */
    child(name, metaData = {}) {
        throw new Error("Not Implemented.");
    }
}

export class DefaultConsoleLog extends ApplicationLog {
    constructor(name, metaData = {}) {
        super();
        this._template = {name: name};
        Object.assign(this._template, metaData);
    }

    createMessage(message, level = "silly", ...args) {
        let _statement = {level: level};
        Object.assign(_statement, this._template);
        if(args && args.length) _statement.data = args;
        _statement.message = message;
        return JSON.stringify(_statement);
    }

    debug(message, ...args) {
        console.debug(this.createMessage(message, "debug", ...args));
    }

    error(message, ...args) {
        console.error(this.createMessage(message, "error", ...args));
    }

    info(message, ...args) {
        console.info(this.createMessage(message, "info", ...args));
    }

    silly(message, ...args) {
        console.debug(this.createMessage(message, "silly", ...args));
    }

    threat(message, ...args) {
        console.error(this.createMessage(message, "threat", ...args));
    }

    verbose(message, ...args) {
        console.debug(this.createMessage(message, "verbose", ...args));
    }

    warn(message, ...args) {
        console.error(this.createMessage(message, "warn", ...args));
    }

    child(name, metaData = {}) {
        return new DefaultConsoleLog(this._template.name, {path: name});
    }
}