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
export class WebRequest {
    constructor(request) {
        this._request = request;
        /**@type{Map<string, string>}*/this._params = new Map();
        /**@type{Map<string, string>}*/this._query = new Map();
        this._uri = "";
    }

    _parseUri(url) {
        // Use the URL constructor to parse the URI
        let _parsedUrl = new URL(url, "https://localhost");
        this._uri = _parsedUrl.pathname;

        // Split the pathname into resources by "/"
        let _parts  = this._uri
            .split('/')
            .filter(part => part !== ''); // Filter out empty parts

        // Parse query parameters and store them in a Map
        _parsedUrl.searchParams.forEach((value, key) => {
            this._query.set(key, value);
        });
    }

    prepare() {
        this._parseUri(this._request.url);
    }

    /**
     * @description
     * @return {import("http").IncomingMessage}
     */
    get http() {
        return this._request;
    }

    /**
     * @description
     * @return {string}
     */
    get url() {
        return this._request.url;
    }

    /**
     * @description
     * @return {string}
     */
    get uri() {
        return this._uri;
    }

    /**
     * @description
     * @return {string}
     */
    get method() {
        return this._request.method.toLowerCase();
    }

    /**
     * @description
     * @return {Map<string, string>}
     */
    get query() {
        return this._query;
    }

    /**
     * @description
     * @return {Map<string, string>}
     */
    get params() {
        return this._params;
    }

    /**
     * @description
     * @param {string} name
     * @param {string} value
     */
    addParam(name, value) {
        this._params.set(name, value);
    }

    /**
     * @description
     * @param {string} name
     * @param {string|null} [defaultValue]
     * @returns {string|null}
     */
    getParam(name, defaultValue = null) {
        let _param = this._params.get(name);
        return (_param)? _param : defaultValue;
    }
}