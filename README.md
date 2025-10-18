# vite-plugin-cds

A [vite](https://vitejs.dev/) plugin for the [SAP Cloud Application Programming Model](https://cap.cloud.sap/).

- Run `vite` apps via `cds watch`
- Import `.cds` model files in your vite app
- Build the `cds runtime` along with your vite app (limited support)

## Usage

### Run vite apps via `cds watch`

Install vite and the plugin as a development dependency in the root of your CAP project.

```sh
npm install --save-dev vite vite-plugin-cds
```

Add a `vite.config.js` file to any frontend applications in the `app/` folder of your CAP project.

As example:

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
import { cds } from 'vite-plugin-cds';

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

The cds runtime needs Node.js built-in modules which are not available in the browser. This repo contains a plugin with very basic polyfills necessary to make the cds runtime compile in the browser. For a more complete solution, consider other polyfill libraries.

```js
// vite.config.js
import { defineConfig } from 'vite'
import { node, cap } from 'vite-plugin-cds';

export default defineConfig({
  plugins: [ node(), cap() ],
  root: './',
})
```

In your frontend vite app, you can now use parts of the cds runtime.

```js
import cds from '@sap/cds';
const csn = cds.compile('entity Books {key ID: Integer; title: String}')
console.log(csn.definitions)
```

> [Example App](./test/cap-plugin)

Due to Node.js dependencies, functionality is very limited.
