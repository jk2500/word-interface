const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // ...other config
  optimization: {
    moduleIds: isProduction ? 'deterministic' : 'named', // Use deterministic in production for better caching
    runtimeChunk: 'single',
    removeAvailableModules: isProduction,
    removeEmptyChunks: isProduction,
    // Enable code splitting in production
    splitChunks: isProduction ? {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name of the npm package
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    } : false,
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
  },
  performance: {
    // Enable performance hints in production
    hints: isProduction ? 'warning' : false,
    // Set reasonable limits for production builds
    maxAssetSize: 512000, // 500 KiB
    maxEntrypointSize: 512000, // 500 KiB
  }
}