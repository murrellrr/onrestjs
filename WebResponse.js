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
        if(!body) {
            code = 204;
            message = "No Content";
        }
        else {
            //
        }
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