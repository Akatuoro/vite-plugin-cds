# Vite Plugin for CAP in the Browser

## Mechanisms

The CAP Node.js runtime `@sap/cds` is written in JS. There are however a few hurdles to overcome when running in the Browser:
- No Node.js dependencies available -> use [node](../node/) plugin or another Node.js compatibility layer
- Express is not available in the browser -> mocked as part of the node plugin
- better-sqlite3 is not available in the browser -> use sqlite3-wasm with a compatibility layer to better-sqlite3
  - potentially: compile better-sqlite3 to wasm
- Cut off unnecessary libs by injecting a noop
- The cds-compiler includes a `lazyload` mechanism which can be replaced with `require`
- The cds runtime relies heavily on dynamic loading of certain dependencies (auth, protocol adapters, service layer, db layer, cds.env, ...)
  - These modules can be defined via rollup dynamic loading or a custom module preload
  - Importing protocol adapters directly via `require` leads to circular dependencies, so a dynamic import is necessary
- ESM CJS compatibility needs to be handled, particularly ESM default interop during runtime
  - some polyfills/shims are cjs on purpose to avoid ESM default interop issues
  - some `require`s are replaced with `(require(...).default ?? require(...))`
- The cds runtime relies on reflection, so any renaming must be disabled (esbuild: keepNames; rollup: minify: false, preserveModules, preserveEntrySignatures)
- `@sap/cds/lib/test/cds-test.js` has a particular import/export behavior which can not be parsed correctly by esbuild / rollup / rollup-commonjs

