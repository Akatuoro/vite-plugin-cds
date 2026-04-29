import { defineConfig } from 'vite'
import { cap, node } from '../../';

const config = defineConfig({
  plugins: [ node({ fs: '@isomorphic-git/lightning-fs' }), cap() ],
  worker: {
    plugins: () => config.plugins
  },
  root: '../cap-plugin/',
})

export default config;
