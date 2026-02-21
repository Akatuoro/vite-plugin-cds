# vite-plugin-cds

A [vite](https://vitejs.dev/) plugin for [@sap/cds](https://cap.cloud.sap/).

- `vite` [apps](#vite-apps-with-cds-watch) with `cds watch`
- [Import](#import-cds-model-files-in-your-vite-app) `.cds` model files in your vite app
- `@sap/cds` [in the browser](#cds-in-the-browser)

<img width="2672" height="1522" alt="On the left: Page with title 'CDS Plugin Test', a compile result, an OData response and a compile result from a worker. On the right: DevTools Console calling cds.compile, await INSERT.into and await cds.ql" src="https://github.com/user-attachments/assets/e037669f-3814-437b-b5b0-c1ff3cb0ab04" />


## Usage

Prerequisite:
- This library has a peer dependency to [@sap/cds](https://www.npmjs.com/package/@sap/cds).

### Vite apps with `cds watch`

Install vite and this plugin as development dependencies in your CAP project.

```sh
npm install --save-dev vite vite-plugin-cds
```

Add a `vite.config.js` to any frontend application in the `app/` folder of your CAP project.

```
app/
  my-vite-app/
    index.html
    vite-config.js
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

In your vite app, you can now import cds model files.

```js
import cdsModel from './index.cds';
```

> [Example App](./test/cds-plugin)

### `cds` in the browser

You need the following dependencies for a functional runtime:

```sh
npm install --save-dev vite vite-plugin-cds @sap/cds @cap-js/sqlite @sqlite.org/sqlite-wasm express
```

Configure the plugins in your vite config:

```js
// vite.config.js
import { defineConfig } from 'vite'
import { node, cap } from 'vite-plugin-cds'

export default defineConfig({
  plugins: [ node(), cap() ],
  root: './',
})
```

In your frontend vite app, you can now compile a model and start the cds runtime:

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

cds.model = cds.compile.for.nodejs (csn);
cds.db = await cds.connect.to('db');
await cds.deploy(csn).to(cds.db);

const app = express();
await cds.serve('all').from(csn).in(app);

const response = await app.handle({url: '/odata/v4/catalog/Books'}) // part of polyfill
console.log('response', response);
```

> [Example App](./test/cap-plugin)

Known limitations:
- `cds.context` is not unique per request / transaction, see [asynchronous context tracking](./cap/README.md#asynchronous-context-tracking)
