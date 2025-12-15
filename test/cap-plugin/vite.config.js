import { defineConfig } from 'vite'
import { cap, node, sqlite3 } from '../../';

export default defineConfig({
  plugins: [ node(), sqlite3(), cap() ],
  root: './',
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
})
