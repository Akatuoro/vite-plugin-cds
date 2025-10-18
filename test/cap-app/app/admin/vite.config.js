import { defineConfig } from 'vite'

export default defineConfig({
  root: './',
  define: {
    endpoint: '"/odata/v4/admin/Books"'
  }
})
