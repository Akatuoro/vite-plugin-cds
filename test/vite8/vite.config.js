import { defineConfig } from 'vite'
import { cap, node } from 'vite-plugin-cds';

const plugins = [ node(), cap() ]
const config = defineConfig({
  plugins,
  optimizeDeps: {
    include: ['cjs-package', '@sap/cds', '@sap/cds-compiler'],
    rolldownOptions: {
      plugins,
    }
  },
  build: {
    minify: false,
    rolldownOptions: {
      plugins,
    }
  },
  root: './',
})

export default config;
