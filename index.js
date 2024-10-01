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

import {WebApplication} from "./WebApplication.js";

export * from "./ApplicationLog.js";
export * from "./AsyncEventEmitter.js";
export * from "./Context.js";
export * from "./EntityMap.js";
export * from "./Events.js";
export * from "./Resource.js";
export * from "./Subject.js";
export * from "./Security.js"
export * from "./WebApplication.js";
export * from "./WebError.js";
export * from "./WebEvent.js";
export * from "./WebRequest.js";
export * from "./WebResponse.js";

/**
 * @description
 * @param {string} name
 * @param {number} [port]
 * @param {string} [path]
 * @return {WebApplication}
 */
export default (name, port = 3000, path = "/") => {
    return new WebApplication(name, port);
}
