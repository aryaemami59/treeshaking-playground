import commonjsPlugin from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replacePlugin from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'

export default defineConfig((commandLineArguments) => ({
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
    commonjsPlugin(),
    nodeResolve(),
    replacePlugin({
      values: { 'process.env.NODE_ENV': JSON.stringify('production') },
      preventAssignment: true,
    }),
  ],
  // ...commandLineArguments,
}))
