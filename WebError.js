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
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class WebError extends Error {
    constructor(message, code = 500, cause = null) {
        super(message);
        this._code = code;
        this._cause = cause;
    }

    get code() {
        return this._code;
    }

    get cause() {
        return this._cause;
    }

    safe() {
        return {
            code: this._code,
            message: this.message
        }
    }

    toString() {
        return `Error: ${this._code} ${this.message}\r\n\tCause: ${String(this._cause)}`
    }

    /**
     * @description
     * @param {*} error
     * @return {null}
     */
    static fromError(error) {
        if(error instanceof WebError) return error;
        else return new WebError("Internal Server Error", 500, error);
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class NotImplementedError extends WebError {
    constructor(path) {
        super(`${path} not implemented.`, 504, path);
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class FileNotFoundError extends WebError {
    constructor(path) {
        super(`${path} not found.`, 404, path);
        this._path = path;
    }

    get path() {return this._path;}

    safe() {
        let _safe = super.safe();
        _safe.path = this._path;
        return _safe;
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class BadRequest extends WebError {
    constructor(errors, cause = null) {
        super("Bad Request", 400, cause);
        this._errors = errors;
    }

    get errors() {
        return this._errors;
    }

    safe() {
        let _safe = super.safe();
        _safe.errors = this._errors;
        return _safe;
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class MethodNotAllowedError extends WebError {
    constructor(cause = null) {
        super("Method Not Allowed", 405, cause);
    }
}