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

export class RouterOptions {
	root = window.location.pathname;
	removeDomain = true;
	preCallback?: CallableFunction;
	postCallback?: CallableFunction;
}

class Router extends EventTarget {
	routes: Route[] = [];
	options: RouterOptions;
	lastPath = "";
	mode: RouterMode;

	constructor(mode: RouterMode = RouterMode.History, options: RouterOptions = new RouterOptions()) {
		super();
		
		this.options = options;
		this.options.root = this.normalizePath(this.options.root);
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
			window.history.pushState(null, "", this.normalizePath(`${this.options.root}/${path}`));
		} else if (this.mode == RouterMode.Hash) {
			window.location.hash = this.normalizePath(path);
		}
		
		this.run();
	}

	link(path: string, urlOnly: boolean = false): string {
		let url: string = "";

		if (this.mode == RouterMode.Hash) {
			let root = this.options.root;
			if (this.options.root != "/") root += "/";
			url = `${root}#${this.normalizePath(path)}`;
		} else if (this.mode == RouterMode.History) {
			url = this.normalizePath(`${this.options.root}/${path}`);
		}

		if (urlOnly) return url;

		return `href="${url}" rel="router"`;
	}

	handleLink(e: Event): void {
		e.preventDefault();

		let path = (e.target as HTMLAnchorElement).href;

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

	run(): void {
		if (this.mode == RouterMode.Hash && window.location.hash == "") {
			this.navigate("/");
		}

		let current = this.getCurrentPath();
		if (this.lastPath == current) return;
		let routeFound = this.routes.some((route: Route) => this.checkAndRun(route, current));
		this.lastPath = current;

		document.querySelectorAll("a[rel=\"router\"]").forEach((e: Element) => {
			(e as HTMLAnchorElement).addEventListener("click", this.handleLink.bind(this));
		});

		if (!routeFound) {
			this.dispatchEvent(new Event("notfound"));
		}
	}

	checkAndRun(route: Route, path: string): boolean {
		if (route.path == path) {
			this.callRoute(route, path);
			return true;
		}

		let pathSegments = this.getPathSegments(path);
		let routeSegments = this.getPathSegments(route.path);
		let args = new Map<string, string>();

		if (pathSegments.length != routeSegments.length) return false;

		for (let i = 0; i < pathSegments.length; ++i) {
			let ps = pathSegments[i];
			let rs = routeSegments[i];

			if (ps == rs) continue;

			if (rs.startsWith(":")) {
				let argName = rs.substr(1);
				args.set(argName, ps);
			} else {
				return false;
			}
		}

		this.callRoute(route, path, args);
		return true;
	}

	callRoute(route: Route, url: String, args?: Map<string, string>) {
		if (this.options.preCallback) {
			if (this.options.preCallback(this, route, url, args) === false) {
				return;
			}
		}

		route.callback(args, route, this);
		
		if (this.options.postCallback) {
			this.options.postCallback(this, route, url, args);
		}
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

			if (this.options.root != "/" && path.startsWith(this.options.root)) {
				path = this.normalizePath(path.substr(this.options.root.length));
			}
		} else if (this.mode == RouterMode.Hash) {
			if (window.location.hash == "") return "/";
			path = this.normalizePath(decodeURI(window.location.hash.substr(1)));
		}

		return path;
	}
}

export default Router;
