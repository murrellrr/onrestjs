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

export const Events = {
    action: { // Won't run until AAA complete.
        enqueue: {
            On: "action.enqueue",
            OnAfter: "action.enqueue.after",
            OnBefore: "action.enqueue.before"
        },
        execute: {
            On: "action.execute",
            OnAfter: "action.execute.after",
            OnBefore: "action.execute.before"
        },
        error: {
            On: "action.error"
        }
    },
    app: {
        auth: {
            authenticate: {
                On: "app.auth.authenticate",
                OnAfter: "app.auth.authenticate.after",
                OnBefore: "app.auth.authenticate.before",
                OnReject: "app.auth.authenticate.reject"
            },
            authorize: {
                On: "app.auth.authorize",
                OnAfter: "app.auth.authorize.after",
                OnBefore: "app.auth.authorize.before",
                OnDeny: "app.auth.authenticate.deny"
            },
            audit: {
                On: "app.auth.audit",
            },
            error: {
                On: "app.auth.error",
            }
        },
        log: {
            initialize: {
                On: "app.log.initialize",
                OnAfter: "app.log.initialize.after",
                OnBefore: "app.log.initialize.before"
            }
        },
        properties: {
            initialize: {
                On: "app.log.initialize",
                OnAfter: "app.log.initialize.after",
                OnBefore: "app.log.initialize.before"
            }
        },
        fail: {
            On: "app.fail"
        },
        initialize: {
            OnAfter: "app.initialize.after",
            OnBefore: "app.initialize.before"
        },
        listen: {
            On: "app.listen"
        },
        start: {
            OnAfter: "app.start.after",
            OnBefore: "app.start.before"
        },
        stop: {
            OnAfter: "app.stop.after",
            OnBefore: "app.stop.before"
        },
        terminate: {
            OnAfter: "app.terminate.after",
            OnBefore: "app.terminate.before"
        }
    },
    entity: { // Won't run until AAA complete.
        create: {
            On: "entity.create",
            OnAfter: "entity.create.after",
            OnBefore: "entity.create.before"
        },
        delete: {
            On: "entity.delete",
            OnAfter: "entity.delete.after",
            OnBefore: "entity.delete.before"
        },
        page: {
            On: "entity.page",
            OnAfter: "entity.page.after",
            OnBefore: "entity.page.before"
        },
        read: {
            On: "entity.read",
            OnAfter: "entity.read.after",
            OnBefore: "entity.read.before"
        },
        update: {
            On: "entity.update",
            OnAfter: "entity.update.after",
            OnBefore: "entity.update.before"
        },
        error: {
            On: "entity.error"
        }
    },
    http: {
        error: {
            On: "http.error",
        },
        request: {
            methods: { // Won't run until AAA complete
                OnDelete: "http.request.method.delete",
                OnGet: "http.request.method.get",
                OnHead: "http.request.method.head",
                OnOptions: "http.request.method.options",
                OnPatch: "http.request.method.patch",
                OnPost: "http.request.method.post",
                OnPut: "http.request.method.put",
                OnTrace: "http.request.method.trace"
            },
            OnAfter: "http.request.after",
            OnBefore: "http.request.before",
            transform: {
                On: "http.request.transform",
                OnAfter: "http.request.transform.after",
                OnBefore: "http.request.transform.before"
            },
            validate: {
                body: {
                    OnAfter: "http.request.validate.body.after",
                    OnBefore: "http.request.validate.body.before"
                }
            }
        },
        response: {
            On: "http.response",
            OnAfter: "http.response.after",
            OnBefore: "http.response.before",
            transform: {
                On: "http.response.transform",
                OnAfter: "http.response.transform.after",
                OnBefore: "http.response.transform.before"
            }
        }
    },
    namespace: {
        On: "namespace.on",
    },
    plugin: {
        install: {
            On: "plugin.install",
            OnAfter: "plugin.install.after",
            OnBefore: "plugin.install.before"
        },
        start: {
            On: "plugin.start",
            OnAfter: "plugin.start.after",
            OnBefore: "plugin.start.before"
        },
        stop: {
            On: "plugin.stop",
            OnAfter: "plugin.stop.after",
            OnBefore: "plugin.stop.before"
        }
    }
};