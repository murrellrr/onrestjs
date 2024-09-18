


export class WebResponse {
    constructor(response) {
        this._response = response;
        this._code = 200;
        this._message = "OK";
        this._body = {};
    }

    prepare() {
        //
    }

    send(body, code = 200, message = "OK") {
        //
    }

    /**
     * @description
     * @return {import("http").ServerResponse}
     */
    get http() {
        return this._response;
    }

    /**
     * @description
     * @return {number}
     */
    get code() {
        return  this._code;
    }

    /**
     * @description
     * @return {string}
     */
    get message() {
        return this._message;
    }

    /**
     * @description
     * @return {object}
     */
    get body() {
        return  this._body;
    }
}