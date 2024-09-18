

export class WebRequest {
    constructor(request) {
        this._request = request;
        this._params = null;
        this._query = new Map();
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
     * @return {Map<any, any>}
     */
    get query() {
        return this._query;
    }

    /**
     * @description
     * @return {RequestParams}
     */
    get params() {
        return this._params;
    }
}