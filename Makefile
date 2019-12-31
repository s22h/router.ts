all: dist/router.es6.js dist/router.common.js dist/router.amd.js

dist/router.es6.js: src/router.ts dist/router.common.js
	tsc $< --outFile $@ --target es6 --module system

dist/router.common.js: src/router.ts
	tsc $< --outDir $(dir $@) --target es6 --module CommonJS
	mv $(dir $@)router.js $@

dist/router.amd.js: src/router.ts
	tsc $< --outFile $@ --target es6 --module amd
