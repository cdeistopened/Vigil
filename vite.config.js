import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3333,
    open: false,
    host: true,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})