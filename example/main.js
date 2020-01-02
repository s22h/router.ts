import { Router, RouterMode } from "../dist/es6/router.js";

let router = new Router(RouterMode.Hash);

router.add("/", function() {
	document.body.textContent = "INDEX PAGE";
});

router.add("/post/:id", function(args) {
	document.body.textContent = `POST ${args.get("id")}`;
});

router.addEventListener("notfound", e => {
	document.body.textContent = "404 not found";
});

router.run();
