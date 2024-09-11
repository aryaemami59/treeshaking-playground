import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'

export default defineConfig({
  treeshake: true,
  experimentalLogSideEffects: true,
  // preserveEntrySignatures: 'strict',
  // external: ['immer', 'reselect'],
  // external: Object.keys(dependencies)
  //   .concat(Object.keys(peerDependencies))
  //   .concat(['use-sync-external-store/with-selector.js']),
  // external: [
  //   'react',
  //   'use-sync-external-store',
  //   // 'react-dom',
  //   'use-sync-external-store/with-selector.js',
  //   'redux',
  //   // 'immer',
  //   // 'reselect',
  // ],
  input: 'src/index.ts',
  output: [
    {
      // dir: 'dist',
      // preserveModules: true,
      file: 'dist/withRollup.js',
      // format: 'module',
      // interop: "esModule",
      format: 'esm',
      // exports: 'named',
      // validate: true,
      // strict: true,
      // interop: 'esModule'
      // esModule: "if-default-prop",
      // indent: true,
      // strict: true,
      // dynamicImportInCjs: true,

      // esModule: "if-default-prop",
      // interop: 'auto',
    },
    // {
    //   file: './dist/withRollupUglified.js',
    //   format: 'esm',
    //   plugins: [
    //     terser({
    //       mangle: false,
    //       output: {
    //         beautify: true,
    //       },
    //     }),
    //   ],
    // },
  ],
  plugins: [
    // commonjs({
    //   // extensions: ['.cjs'],
    //   // requireReturnsDefault: "preferred",
    //   // esmExternals: true,
    //   // requireReturnsDefault: 'namespace',
    //   // defaultIsModuleExports: false,
    //   // esmExternals: true,
    //   // strictRequires: true,
    // }),
    nodeResolve({
      // extensions: ['.cjs'],
      // exportConditions: ['require'],
      // resolveOnly: ['reselect'],
      // mainFields: ['main'],
    }),
    // nodeResolve({ exportConditions: ['require'], extensions: ['.cjs'] }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
  ],
})
