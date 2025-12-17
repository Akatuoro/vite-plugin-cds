import { defineConfig } from 'vite'
import { cap, node, sqlite3 } from '../../';

export default defineConfig({
  plugins: [ node(), sqlite3(), cap() ],
  root: './',
})
