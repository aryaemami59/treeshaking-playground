import TerserPlugin from 'terser-webpack-plugin'
import type { WebpackConfiguration } from 'webpack-dev-server'

const config = {
  optimization: {
    sideEffects: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          output: {
            beautify: true,
          },
        },
      }),
    ],
  },
  entry: './src/index.ts',
  mode: 'production',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  experiments: { outputModule: true },
  output: {
    library: { type: 'module' },
    libraryTarget: 'module',
    clean: true,
    filename: 'withWebpack.js',
  },
} satisfies WebpackConfiguration

export default config
