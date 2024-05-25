import TerserPlugin from 'terser-webpack-plugin'

/**
 * @type {import('webpack-dev-server').WebpackConfiguration}
 */
const config = {
  optimization: {
    // sideEffects: "flag",
    // sideEffects: true,
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
    filename: './webpacked.js',
  },
}

export default config
