import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: { minify: false, emptyOutDir: false },
  // esbuild: { exclude: ["react", "react-dom"] },
  // build: { lib: { entry: "src/index.ts", formats: ["es"] } },
})
