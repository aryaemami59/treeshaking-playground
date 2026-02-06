import type { BuildOptions } from 'esbuild'
import { build } from 'esbuild'

build({
  bundle: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  entryPoints: [{ in: 'src/index.ts', out: 'withEsbuild.js' }],
  format: 'esm',
  logLevel: 'verbose',
  outdir: 'dist',
  platform: 'node',
  target: ['esnext'],
  treeShaking: true,
} as const satisfies BuildOptions)
