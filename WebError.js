


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