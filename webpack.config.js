module.exports = {
  // ...other config
  optimization: {
    moduleIds: 'named', // helps with debugging
    runtimeChunk: 'single',
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
  },
  performance: {
    hints: false,
  }
} 