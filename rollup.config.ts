import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'

export default defineConfig({
  treeshake: true,
  experimentalLogSideEffects: true,
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/withRollup.js',
      format: 'esm',
    },
  ],
  plugins: [
    commonjs({}),
    nodeResolve({}),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
  ],
})
