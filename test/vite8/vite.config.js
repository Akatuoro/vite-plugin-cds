import { defineConfig } from 'vite'
import { cap, node } from 'vite-plugin-cds';

const plugins = [ node(), cap() ]
const config = defineConfig({
  plugins,
  optimizeDeps: {
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
