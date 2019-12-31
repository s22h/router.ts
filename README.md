# Frontend router

A simple frontend router written in Typescript. It uses history.push and the 
PopState event to handle navigation.

## Example

```javascript
import Router from "./router.es6.js";

let router = new Router();

router.add("/", function() {
	// SHOW INDEX PAGE
});

router.add("/signin", function() {
	// SHOW SIGNIN FORM
});

router.run();

```
