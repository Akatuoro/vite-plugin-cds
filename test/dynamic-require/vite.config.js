import { defineConfig } from 'vite'
import path from 'path';

const dynamicRequireRoot = '../../';

const resolveDynReqTarget = (rel) => {
  let root = dynamicRequireRoot;
  if (!dynamicRequireRoot.endsWith('/')) root += '/';
  const relFromRoot = path.relative(dynamicRequireRoot, rel);

  return dynamicRequireRoot + relFromRoot;
}

export default defineConfig({
  build: {
    minify: false,
    commonjsOptions: {
      dynamicRequireTargets: [
        './lib.js',
      ].map(resolveDynReqTarget),
      dynamicRequireRoot,
      include: ['*.js', 'dynamic-require/*.js', /test/, /dynamic-require/]
      // ignoreDynamicRequires: true,
      // requireReturnsDefault: "auto",
      // strictRequires: "auto",
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
