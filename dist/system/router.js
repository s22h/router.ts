System.register([], function (exports_1, context_1) {
    "use strict";
    var Route, RouterMode, RouterOptions, Router;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            Route = class Route {
                constructor(path, callback) {
                    this.path = path;
                    this.callback = callback;
                }
            };
            exports_1("Route", Route);
            (function (RouterMode) {
                RouterMode[RouterMode["History"] = 0] = "History";
                RouterMode[RouterMode["Hash"] = 1] = "Hash";
            })(RouterMode || (RouterMode = {}));
            exports_1("RouterMode", RouterMode);
            RouterOptions = class RouterOptions {
                constructor() {
                    this.root = window.location.pathname;
                    this.removeDomain = true;
                    this.preCallback = null;
                    this.postCallback = null;
                }
            };
            exports_1("RouterOptions", RouterOptions);
            Router = class Router extends EventTarget {
                constructor(mode = RouterMode.History, options = new RouterOptions()) {
                    super();
                    this.routes = [];
                    this.lastPath = "";
                    this.options = options;
                    this.options.root = this.normalizePath(this.options.root);
                    this.mode = mode;
                    if (this.mode == RouterMode.History) {
                        window.addEventListener("popstate", (_) => this.run());
                    }
                    else if (this.mode == RouterMode.Hash) {
                        window.addEventListener("hashchange", (_) => this.run());
                    }
                }
                add(path, callback) {
                    this.routes.push(new Route(this.normalizePath(path), callback));
                }
                remove(path) {
                    for (let i = 0; i < this.routes.length; ++i) {
                        if (this.routes[i].path == this.normalizePath(path)) {
                            this.routes.slice(i, 1);
                            return true;
                        }
                    }
                    return false;
                }
                navigate(path) {
                    if (this.mode == RouterMode.History) {
                        window.history.pushState(null, "", this.normalizePath(`${this.options.root}/${path}`));
                    }
                    else if (this.mode == RouterMode.Hash) {
                        window.location.hash = this.normalizePath(path);
                    }
                    this.run();
                }
                link(path, urlOnly = false) {
                    let url = "";
                    if (this.mode == RouterMode.Hash) {
                        let root = this.options.root;
                        if (this.options.root != "/")
                            root += "/";
                        url = `${root}#${this.normalizePath(path)}`;
                    }
                    else if (this.mode == RouterMode.History) {
                        url = this.normalizePath(`${this.options.root}/${path}`);
                    }
                    if (urlOnly)
                        return url;
                    return `href="${url}" rel="router"`;
                }
                handleLink(e) {
                    e.preventDefault();
                    let path = e.target.href;
                    if (this.options.removeDomain) {
                        let base = `${window.location.protocol}//${window.location.host}`;
                        if (path.startsWith(base)) {
                            path = path.substr(base.length);
                        }
                    }
                    if (this.options.root != "/" && path.startsWith(this.options.root)) {
                        path = this.normalizePath(path.substr(this.options.root.length));
                    }
                    this.navigate(path);
                }
                run() {
                    if (this.mode == RouterMode.Hash && window.location.hash == "") {
                        this.navigate("/");
                    }
                    let current = this.getCurrentPath();
                    if (this.lastPath == current)
                        return;
                    let routeFound = this.routes.some((route) => this.checkAndRun(route, current));
                    this.lastPath = current;
                    document.querySelectorAll("a[rel=\"router\"]").forEach((e) => {
                        e.addEventListener("click", this.handleLink.bind(this));
                    });
                    if (!routeFound) {
                        this.dispatchEvent(new Event("notfound"));
                    }
                }
                checkAndRun(route, path) {
                    if (route.path == path) {
                        this.callRoute(route, path);
                        return true;
                    }
                    let pathSegments = this.getPathSegments(path);
                    let routeSegments = this.getPathSegments(route.path);
                    let args = new Map();
                    if (pathSegments.length != routeSegments.length)
                        return false;
                    for (let i = 0; i < pathSegments.length; ++i) {
                        let ps = pathSegments[i];
                        let rs = routeSegments[i];
                        if (ps == rs)
                            continue;
                        if (rs.startsWith(":")) {
                            let argName = rs.substr(1);
                            args.set(argName, ps);
                        }
                        else {
                            return false;
                        }
                    }
                    this.callRoute(route, path, args);
                    return true;
                }
                callRoute(route, url, args) {
                    if (this.options.preCallback) {
                        if (this.options.preCallback(this, route, url, args) === false) {
                            return;
                        }
                    }
                    route.callback(args, route, this);
                    if (this.options.postCallback) {
                        this.options.preCallback(this, route, url, args);
                    }
                }
                normalizePath(path) {
                    if (path.trim() == "/")
                        return "/";
                    let parts = path.split("/");
                    let normalized = [];
                    for (let i = 0; i < parts.length; ++i) {
                        if (parts[i].trim() == "")
                            continue;
                        if (parts[i].trim() == ".")
                            continue;
                        if (parts[i].trim() == "..") {
                            if (normalized.length == 0)
                                throw "Path tries to exit root";
                            normalized.pop();
                        }
                        normalized.push(parts[i]);
                    }
                    let n = normalized.join("/").trim();
                    if (n == "")
                        return "/";
                    return `/${n}`;
                }
                getPathSegments(path) {
                    let segments = this.normalizePath(path).substr(1).split("/");
                    return segments;
                }
                getCurrentPath() {
                    let path = "/";
                    if (this.mode == RouterMode.History) {
                        path = this.normalizePath(decodeURI(window.location.pathname + window.location.search));
                        if (this.options.root != "/" && path.startsWith(this.options.root)) {
                            path = this.normalizePath(path.substr(this.options.root.length));
                        }
                    }
                    else if (this.mode == RouterMode.Hash) {
                        if (window.location.hash == "")
                            return "/";
                        path = this.normalizePath(decodeURI(window.location.hash.substr(1)));
                    }
                    return path;
                }
            };
            exports_1("default", Router);
        }
    };
});
