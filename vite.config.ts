import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [viteReact()],
  build: { minify: false, emptyOutDir: true },
})
