import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'

export default defineConfig({
  treeshake: true,
  experimentalLogSideEffects: true,

  // external: ["react", "react-dom"],
  // external: ["react", "react-dom", "use-sync-external-store/with-selector.js"],
  external: [
    'react',
    'react-dom',
    'use-sync-external-store/with-selector.js',
    'immer',
    'reselect',
  ],
  input: './src/index.ts',
  output: [{ file: './dist/rolluped.js', format: 'esm' }],
  plugins: [
    nodeResolve({}),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  ],
  // plugins: [nodeResolve({ exportConditions: ["require"] })],
})
