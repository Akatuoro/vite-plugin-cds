import { defineConfig } from 'vite'
// import resolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
import { cap, node } from '../../';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dynamicRequireRoot = '../../';

const resolveDynReqTarget = (rel) => {
  let root = dynamicRequireRoot;
  if (!dynamicRequireRoot.endsWith('/')) root += '/';
  const relFromRoot = path.relative(dynamicRequireRoot, rel);
  console.log(dynamicRequireRoot)

  return dynamicRequireRoot + relFromRoot;
}

export default defineConfig({

  // plugins: [node(), cap()],
  build: {
    minify: false,
    // commonjsOptions: {
    //   // be explicit: only transform what you need
    //   include: [/node_modules\/@sap\/cds/, /node_modules/],
    //   transformMixedEsModules: true,

    //   // important: don't treat externals as ESM
    //   esmExternals: false,

    //   // make default-import interop work
    //   requireReturnsDefault: "auto",
    //   defaultIsModuleExports: "auto",
    // },
    commonjsOptions: {
      dynamicRequireTargets: [
        './lib.js',
        './../lib.js',
      ].map(resolveDynReqTarget),
      dynamicRequireRoot,
      include: ['*.js', 'dynamic-require/*.js', /test/, /dynamic-require/]
      // ignoreDynamicRequires: true,
      // requireReturnsDefault: "auto",
      // strictRequires: "auto",
    },

    rollupOptions: {
      // input: "../../node_modules/@sap/cds/lib/index.js",

      output: {
        preserveModules: true,
        // format: "es",
        // sourcemap: true,
      },
      preserveEntrySignatures: true,
    }
  },
  root: './',
})
