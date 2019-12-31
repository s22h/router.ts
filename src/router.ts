export class Route {
	public path: string;
	public callback: CallableFunction;

	constructor(path: string, callback: CallableFunction) {
		this.path = path;
		this.callback = callback;
	}
}

class Router {
	routes: Route[] = [];
	root: string = "/";
	lastPath = "";

	constructor(root: string) {
		if (root) {
			this.root = this.normalizePath(root);
		}

		window.addEventListener("popstate", (_: Event) => this.run());
	}

	add(path: string, callback: CallableFunction): void {
		this.routes.push(new Route(this.normalizePath(path), callback));
	}

	remove(path: string): boolean {
		for (let i = 0; i < this.routes.length; ++i) {
			if (this.routes[i].path == this.normalizePath(path)) {
				this.routes.slice(i, 1);
				return true;
			}
		}

		return false;
	}

	navigate(path: string): void {
		window.history.pushState(null, null, this.normalizePath(`${this.root}/${path}`));
		this.run();
	}

	run() {
		let current = this.getCurrentPath();
		if (this.lastPath == current) return;
		this.routes.some((route: Route) => this.checkAndRun(route));
		this.lastPath = current;
	}

	checkAndRun(route: Route) {
		let path = this.getCurrentPath();

		if (route.path == path) {
			route.callback();
			return true;
		}

		return false;
	}

	normalizePath(path: string): string {
		if (path.trim() == "/") return "/";
 
		let parts = path.split("/");
		let normalized: string[] = [];

		for (let i = 0; i < parts.length; ++i) {
			if (parts[i].trim() == "") continue;
			if (parts[i].trim() == ".") continue;
			if (parts[i].trim() == "..") {
				if (normalized.length == 0) throw "Path tries to exit root";
				normalized.pop();
			}

			normalized.push(parts[i]);
		}

		let n = normalized.join("/").trim();

		if (n == "") return "/";

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

export default Router;
