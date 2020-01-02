"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Route {
    constructor(path, callback) {
        this.path = path;
        this.callback = callback;
    }
}
exports.Route = Route;
var RouterMode;
(function (RouterMode) {
    RouterMode[RouterMode["History"] = 0] = "History";
    RouterMode[RouterMode["Hash"] = 1] = "Hash";
})(RouterMode = exports.RouterMode || (exports.RouterMode = {}));
class Router extends EventTarget {
    constructor(mode = RouterMode.History, root = "/") {
        super();
        this.routes = [];
        this.root = "/";
        this.lastPath = "";
        this.root = this.normalizePath(root);
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
            window.history.pushState(null, null, this.normalizePath(`${this.root}/${path}`));
        }
        else if (this.mode == RouterMode.Hash) {
            window.location.hash = this.normalizePath(path);
        }
        this.run();
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
        if (!routeFound) {
            this.dispatchEvent(new Event("notfound"));
        }
    }
    checkAndRun(route, path) {
        if (route.path == path) {
            route.callback();
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
            console.log(`ps: ${ps} | rs: ${rs}`);
            if (ps == rs)
                continue;
            if (rs.startsWith(":")) {
                let argName = rs.substr(1);
                args.set(argName, ps);
                console.log(args);
            }
            else {
                return false;
            }
        }
        route.callback(args);
        return true;
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
            if (this.root != "/" && path.startsWith(this.root)) {
                path = this.normalizePath(path.substr(0, this.root.length));
            }
        }
        else if (this.mode == RouterMode.Hash) {
            if (window.location.hash == "")
                return "/";
            path = this.normalizePath(decodeURI(window.location.hash.substr(1)));
        }
        return path;
    }
}
exports.Router = Router;
exports.default = Router;
