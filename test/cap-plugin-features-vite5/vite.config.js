import { join, resolve } from 'node:path'
import { readdirSync } from 'node:fs';
import { defineConfig, version} from 'vite'
import { cap, node, cds } from '../../';
import { injectPagesList } from '../cap-plugin-features/lib/plugins';

if (!version.startsWith('5')) throw new Error(`Expecting to test vite version 5, got version ${version}`)

// use pages from cap-plugin-features
const root = '../cap-plugin-features/pages'
const pages = readdirSync(join(__dirname, root)).filter(name => name.endsWith('.html'))

const config = defineConfig({
  plugins: [ node(), cap(), cds(), injectPagesList(pages) ],
  worker: {
    plugins: () => config.plugins
  },
  build: {
    target: ['chrome111', 'edge111', 'firefox114', 'safari16.4'],
    rollupOptions: {
      input: pages.map(name => resolve(__dirname, root, name)),
    }
  },
  root,
})

export default config;
