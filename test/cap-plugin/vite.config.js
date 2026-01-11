import { defineConfig } from 'vite'
import { cap, node } from '../../';
import path from 'path';


const dynamicRequireRoot = '../../';

const resolveDynReqTarget = (rel) => {
  let root = dynamicRequireRoot;
  if (!dynamicRequireRoot.endsWith('/')) root += '/';
  const relFromRoot = path.relative(dynamicRequireRoot, rel);

  return dynamicRequireRoot + relFromRoot;
}

export default defineConfig({
  plugins: [ node(), cap() ],
  build: {
    minify: false,
    commonjsOptions: {
      dynamicRequireTargets: [
        '../../node_modules/@sap/cds/lib/srv/protocols/odata-v4',
        '../../node_modules/@sap/cds/lib/srv/factory',
        '../../node_modules/@sap/cds/srv/app-service.js',
        '../../node_modules/@sap/cds/lib/env/defaults',
        '../../node_modules/@sap/cds/lib/*.js',
        '../../node_modules/@cap-js/sqlite',
        'lib.js'
      ].map(resolveDynReqTarget),
      dynamicRequireRoot,
      ignoreDynamicRequires: true,
      requireReturnsDefault: "preferred",
      include: [/node_modules/, /cap/, /node/, '*.js']
    },

    rollupOptions: {
      output: {
        preserveModules: true,
      },
      preserveEntrySignatures: true,
    }
  },
  root: './',
})
