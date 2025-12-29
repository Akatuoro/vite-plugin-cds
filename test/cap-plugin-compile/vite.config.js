import { defineConfig } from 'vite'
import { cap, node } from '../../';

export default defineConfig({
  plugins: [ node(), cap() ],
  root: './',
})
