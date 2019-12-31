"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Route {
    constructor(path, callback) {
        this.path = path;
        this.callback = callback;
    }
}
exports.Route = Route;
class Router {
    constructor(root) {
        this.routes = [];
        this.root = "/";
        this.lastPath = "";
        if (root) {
            this.root = this.normalizePath(root);
        }
        window.addEventListener("popstate", (_) => this.run());
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
        window.history.pushState(null, null, this.normalizePath(`${this.root}/${path}`));
        this.run();
    }
    run() {
        let current = this.getCurrentPath();
        if (this.lastPath == current)
            return;
        this.routes.some((route) => this.checkAndRun(route));
        this.lastPath = current;
    }
    checkAndRun(route) {
        let path = this.getCurrentPath();
        if (route.path == path) {
            route.callback();
            return true;
        }
        return false;
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
    getCurrentPath() {
        let path = this.normalizePath(decodeURI(window.location.pathname + window.location.search));
        if (this.root != "/" && path.startsWith(this.root)) {
            path = this.normalizePath(path.substr(0, this.root.length));
        }
        return path;
    }
}
exports.default = Router;
