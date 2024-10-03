import TerserPlugin = require('terser-webpack-plugin')
import type { WebpackConfiguration } from 'webpack-dev-server'

const config = {
  optimization: {
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
  // mode: 'development',
  mode: 'production',
  // mode: 'none',
  // infrastructureLogging: { level: 'verbose' },
  // stats: 'verbose',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  devtool: false,
  experiments: { outputModule: true },
  output: {
    library: { type: 'module' },
    // library: { type: 'commonjs-module' },
    libraryTarget: 'module',
    // libraryTarget: 'commonjs-module',
    clean: true,
    filename: 'withWebpack.js',
  },
} satisfies WebpackConfiguration

export default config
