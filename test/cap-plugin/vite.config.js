import { defineConfig } from 'vite'
import { cap, node } from '../../';

export default defineConfig({
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
  root: './',
})
