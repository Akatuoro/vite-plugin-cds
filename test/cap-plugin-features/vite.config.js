import { join, resolve } from 'node:path'
import { readdirSync } from 'node:fs';
import { defineConfig } from 'vite'
import { cap, node, cds } from '../../';
import { injectPagesList } from './lib/plugins';

const pages = readdirSync(join(__dirname, 'pages')).filter(name => name.endsWith('.html'))

const config = defineConfig({
  plugins: [ node(), cap(), cds(), injectPagesList(pages) ],

  worker: {
    plugins: () => config.plugins
  },
  build: {
    rollupOptions: {
      input: pages.map(name => resolve(__dirname, 'pages', name))
    }
  },
  root: './pages',
})

export default config;
