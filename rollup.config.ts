import commonjsPlugin from '@rollup/plugin-commonjs'
import jsonPlugin from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replacePlugin from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'

export default defineConfig((commandLineArguments) => [
  {
    treeshake: true,
    experimentalLogSideEffects: true,
    input: 'src/index.ts',
    output: [
      {
        inlineDynamicImports: true,
        file: 'dist/withRollup.js',
        format: 'esm',
      },
    ],
    plugins: [
      commonjsPlugin(),
      nodeResolve({ preferBuiltins: true }),
      jsonPlugin(),
      replacePlugin({
        values: { 'process.env.NODE_ENV': JSON.stringify('production') },
        preventAssignment: true,
      }),
    ],
    // ...commandLineArguments,
  },
])
