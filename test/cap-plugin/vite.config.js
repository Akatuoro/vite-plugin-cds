import { defineConfig } from 'vite'
import { cap, node } from '../../';

const config = defineConfig({
  plugins: [ node(), cap() ],
  build: {
    minify: false,

    rollupOptions: {
      output: {
        preserveModules: true,
      },
      preserveEntrySignatures: true,
    }
  },
  worker: {
    plugins: () => config.plugins
  },
  root: './',
})

export default config;
