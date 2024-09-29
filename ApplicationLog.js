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

/**
 * @description
 * @abstract
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
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

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
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
        _statement.message = String(message);
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