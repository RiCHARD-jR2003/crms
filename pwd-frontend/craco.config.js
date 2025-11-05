const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Ignore source map warnings for @zxing and html5-qrcode packages
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/@zxing/,
          message: /Failed to parse source map/,
        },
        {
          module: /node_modules\/html5-qrcode/,
          message: /Failed to parse source map/,
        },
      ];

      // Production optimizations
      if (env === 'production') {
        // Enable code splitting
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true, // Remove console.log in production
                  pure_funcs: ['console.log', 'console.info', 'console.debug'],
                  passes: 2, // Multiple passes for better optimization
                },
                format: {
                  comments: false, // Remove comments
                },
              },
              extractComments: false,
            }),
          ],
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              // Vendor chunk for large libraries
              vendor: {
                name: 'vendor',
                chunks: 'all',
                test: /node_modules/,
                priority: 20,
              },
              // Material-UI chunk
              materialui: {
                name: 'material-ui',
                test: /[\\/]node_modules[\\/]@mui[\\/]/,
                chunks: 'all',
                priority: 30,
              },
              // Chart libraries chunk
              charts: {
                name: 'charts',
                test: /[\\/]node_modules[\\/](chart\.js|recharts|react-chartjs-2)[\\/]/,
                chunks: 'all',
                priority: 25,
              },
              // Common chunk
              common: {
                minChunks: 2,
                minSize: 0,
                priority: 10,
                reuseExistingChunk: true,
              },
            },
          },
        };

        // Add compression plugins
        webpackConfig.plugins.push(
          // Gzip compression
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192, // Only compress files larger than 8KB
            minRatio: 0.8,
            deleteOriginalAssets: false,
          })
        );

        // Service Worker for caching with precaching and prefetching
        webpackConfig.plugins.push(
          new GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            cleanupOutdatedCaches: true,
            exclude: [/\.map$/, /asset-manifest\.json$/],
            // Precaching - cache critical resources
            additionalManifestEntries: [
              '/',
              '/dashboard',
              '/login',
              '/register',
            ].map(url => ({ url, revision: null })),
            // Runtime caching with different strategies
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/api\./,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  networkTimeoutSeconds: 10,
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24, // 24 hours
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /\.(?:js|css)$/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'static-resources-cache',
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /\/(dashboard|records|cards|reports|ayuda|announcement)/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'pages-cache',
                  networkTimeoutSeconds: 10,
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24, // 24 hours
                  },
                },
              },
            ],
          })
        );
      }

      return webpackConfig;
    },
  },
};
