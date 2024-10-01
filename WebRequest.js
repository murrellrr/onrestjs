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
export class URI {
    /**
     * Constructs a new UriParser instance.
     * @param {string} uri - The URI to parse.
     */
    constructor(uri) {
        // Split the URI by '/', filter out empty strings to handle leading/trailing/multiple slashes
        this._parts = uri.split("/").filter(part => part.length > 0);
        this._parts.unshift("/");
        this._index = 0;
    }

    /**
     * Retrieves the next part of the URI.
     * @returns {string|undefined} The next part of the URI, or undefined if no more parts are available.
     */
    next() {
        if(this._index < this._parts.length)
            return this._parts[this._index++];
        else
            return undefined; // No more parts to return
    }

    /**
     * @description
     * @returns {string}
     */
    peek() {
        return this._parts[this._index];
    }

    /**
     * Resets the parser to start from the beginning.
     */
    reset() {
        this._index = 0;
    }

    /**
     * Checks if there are more parts to retrieve.
     * @returns {boolean} True if more parts are available, false otherwise.
     */
    hasNext() {
        return this._index < this._parts.length;
    }
}

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
        /**@type{URI}*/this._uri = null;
    }

    _parseUri(url) {
        // Use the URL constructor to parse the URI
        let _parsedUrl = new URL(url, "https://localhost");

        // Split the pathname into resources by "/"
        this._uri = new URI(_parsedUrl.pathname);

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
     * @return {URI}
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