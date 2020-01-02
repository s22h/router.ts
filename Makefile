all: dist/system/router.js dist/commonjs/router.js dist/amd/router.js dist/es6/router.js

dist/system/router.js: src/router.ts
	tsc $< --outDir $(dir $@) --target es6 --module system

dist/commonjs/router.js: src/router.ts
	tsc $< --outDir $(dir $@) --target es6 --module CommonJS

dist/amd/router.js: src/router.ts
	tsc $< --outDir $(dir $@) --target es6 --module amd

dist/es6/router.js: src/router.ts
	tsc $< --outDir $(dir $@) --target es6

