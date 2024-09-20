


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
    http: {
        error: {
            On: "http.error",
        },
        request: {
            auth: {
                authenticate: {
                    On: "http.request.auth.authenticate",
                    OnAfter: "http.request.auth.authenticate.after",
                    OnBefore: "http.request.auth.authenticate.before",
                    OnReject: "http.request.auth.authenticate.reject"
                },
                authorize: {
                    On: "http.request.auth.authorize",
                    OnAfter: "http.request.auth.authorize.after",
                    OnBefore: "http.request.auth.authorize.before",
                    OnDeny: "http.request.auth.authenticate.deny"
                },
                audit: {
                    On: "http.request.auth.audit",
                },
                error: {
                    On: "http.request.auth.error",
                }
            },
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
        OnAfter: "namespace.after",
        OnBefore: "namespace.before"
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
    },
    resource: { // Won't run until AAA complete.
        create: {
            On: "resource.create",
            OnAfter: "resource.create.after",
            OnBefore: "resource.create.before"
        },
        delete: {
            On: "resource.delete",
            OnAfter: "resource.delete.after",
            OnBefore: "resource.delete.before"
        },
        find: {
            On: "resource.find",
            OnAfter: "resource.find.after",
            OnBefore: "resource.find.before"
        },
        read: {
            On: "resource.read",
            OnAfter: "resource.read.after",
            OnBefore: "resource.read.before"
        },
        update: {
            On: "resource.update",
            OnAfter: "resource.update.after",
            OnBefore: "resource.update.before"
        },
        error: {
            On: "resource.error"
        }
    }
};