import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const viteConfig = defineConfig({
  build: {
    emptyOutDir: true,
    minify: false,
  },

  plugins: [viteReact()],
})

export default viteConfig
