import type { BuildOptions } from 'esbuild'
import { build } from 'esbuild'

build({
  bundle: true,
  entryPoints: [{ in: 'src/index.ts', out: 'withEsbuild.js' }],
  outdir: 'dist',
  platform: 'node',
  format: 'esm',
  target: ['esnext'],
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
} satisfies BuildOptions)
