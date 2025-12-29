# vite-plugin-cds

A [vite](https://vitejs.dev/) plugin for [@sap/cds](https://cap.cloud.sap/).

- Run `vite` apps via `cds watch`
- Import `.cds` model files in your vite app
- Build `@sap/cds` along with your vite app to run `cds` in the browser (limited support)

## Usage

Prerequisite:
- This library has a peer dependency to [@sap/cds](https://www.npmjs.com/package/@sap/cds).

### Run vite apps via `cds watch`

Install vite and the plugin as development dependencies in the root of your CAP project.

```sh
npm install --save-dev vite vite-plugin-cds
```

Add a `vite.config.js` to any frontend application in the `app/` folder of your CAP project.

```js
// app/my-vite-app/vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  root: './',
})
```

```html
<!-- app/my-vite-app/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>My Vite App</title>
</head>
<body>
    <h1>My Vite App</h1>
</body>
</html>
```

The index.html is now served automatically via vite when you run:

```sh
cds watch
```

> [Example App](./test/cap-app)

### Import cds model files in your vite app

Add the `cds` plugin to your vite config.

```js
// vite.config.js
import { defineConfig } from 'vite'
import { cds } from 'vite-plugin-cds'

export default defineConfig({
  plugins: [ cds() ],
  root: './',
})
```

In your frontend vite app, you can now import cds model files.

```js
import cdsModel from './index.cds';
```

> [Example App](./test/cds-plugin)

### Build the cds runtime with vite (experimental)

The cds runtime needs Node.js built-in modules which are not available in the browser. This repo contains a plugin with very basic polyfills necessary to run `@sap/cds` in the browser. For a more complete solution, consider other polyfill libraries.

```sh
npm install --save-dev vite vite-plugin-cds @sap/cds @cap-js/sqlite @sqlite.org/sqlite-wasm express
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import { node, cap } from 'vite-plugin-cds'

export default defineConfig({
  plugins: [ node(), cap() ],
  root: './',
})
```

In your frontend vite app, you can now use parts of the cds runtime.

```js
import cds from '@sap/cds'
import sqlite from 'better-sqlite3'
import express from 'express';

//======= compile a csn model =======
const csn = cds.compile(`
entity my.Books {
  key ID: Integer;
  title: String
}
service CatalogService {
  entity Books as projection on my.Books;
}`);
console.log(csn.definitions)

//======= start a cds server =======
await sqlite.initialized // wait for sqlite3-wasm to be ready (part of polyfill)

cds.db = await cds.connect.to('db');
await cds.deploy(csn).to(cds.db);

const app = express();
await cds.serve('all').from(csn).in(app);

const response = await app.handle({url: '/odata/v4/catalog/Books'}) // part of polyfill
console.log('response', response);
```

> [Example App](./test/cap-plugin)

Due to Node.js dependencies, functionality is limited.
