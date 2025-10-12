module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignore source map warnings for @zxing packages
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/@zxing/,
          message: /Failed to parse source map/,
        },
      ];
      
      return webpackConfig;
    },
  },
};
