import { defineConfig } from 'vite'
import { cds } from '../../';

export default defineConfig({
  plugins: [ cds() ],
  root: './',
})
