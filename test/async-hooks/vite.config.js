import { defineConfig } from 'vite'
import { cap, node } from '../../';

const config = defineConfig({
  plugins: [ node(), cap() ],
  worker: {
    plugins: () => config.plugins
  },
  root: './',
})

export default config;
