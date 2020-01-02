export class Route {
	public path: string;
	public callback: CallableFunction;

	constructor(path: string, callback: CallableFunction) {
		this.path = path;
		this.callback = callback;
	}
}

export enum RouterMode {
	History,
	Hash
}

export class Router extends EventTarget {
	routes: Route[] = [];
	root: string = "/";
	lastPath = "";
	mode: RouterMode;

	constructor(mode: RouterMode = RouterMode.History, root: string = "/") {
		super();

		this.root = this.normalizePath(root);
		this.mode = mode;

		if (this.mode == RouterMode.History) {
			window.addEventListener("popstate", (_: Event) => this.run());
		} else if (this.mode == RouterMode.Hash) {
			window.addEventListener("hashchange", (_: Event) => this.run());
		}
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
		if (this.mode == RouterMode.History) {
			window.history.pushState(null, null, this.normalizePath(`${this.root}/${path}`));
		} else if (this.mode == RouterMode.Hash) {
			window.location.hash = this.normalizePath(path);
		}
		
		this.run();
	}

	run(): void {
		if (this.mode == RouterMode.Hash && window.location.hash == "") {
			this.navigate("/");
		}

		let current = this.getCurrentPath();
		if (this.lastPath == current) return;
		let routeFound = this.routes.some((route: Route) => this.checkAndRun(route, current));
		this.lastPath = current;

		if (!routeFound) {
			this.dispatchEvent(new Event("notfound"));
		}
	}

	checkAndRun(route: Route, path: string): boolean {
		if (route.path == path) {
			route.callback();
			return true;
		}

		let pathSegments = this.getPathSegments(path);
		let routeSegments = this.getPathSegments(route.path);
		let args = new Map<string, string>();

		if (pathSegments.length != routeSegments.length) return false;

		for (let i = 0; i < pathSegments.length; ++i) {
			let ps = pathSegments[i];
			let rs = routeSegments[i];

			console.log(`ps: ${ps} | rs: ${rs}`);

			if (ps == rs) continue;

			if (rs.startsWith(":")) {
				let argName = rs.substr(1);
				args.set(argName, ps);
				console.log(args);
			} else {
				return false;
			}
		}

		route.callback(args);
		return true;
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

	getPathSegments(path: string): string[] {
		let segments = this.normalizePath(path).substr(1).split("/");
		return segments;
	}

	getCurrentPath(): string {
		let path = "/";
		
		if (this.mode == RouterMode.History) {
			path = this.normalizePath(decodeURI(window.location.pathname + window.location.search));

			if (this.root != "/" && path.startsWith(this.root)) {
				path = this.normalizePath(path.substr(0, this.root.length));
			}
		} else if (this.mode == RouterMode.Hash) {
			if (window.location.hash == "") return "/";
			path = this.normalizePath(decodeURI(window.location.hash.substr(1)));
		}

		return path;
	}
}

export default Router;
