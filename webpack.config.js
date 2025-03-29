/**
 * Webpack Configuration
 * Steam Deck DUB Edition
 * 
 * This configuration bundles JavaScript and CSS files without minification
 * for better readability during development.
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CriticalCssPlugin = require('critical-css-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// This plugin is used to add cache-control headers in production
const CacheControlHeadersPlugin = {
  apply(compiler) {
    compiler.hooks.emit.tap('CacheControlHeadersPlugin', compilation => {
      // Create a headers file for Netlify, Vercel, or other static hosts
      const headers = {
        '/*': [
          'Cache-Control: public, max-age=0, must-revalidate'
        ],
        '/assets/*': [
          'Cache-Control: public, max-age=31536000, immutable'
        ],
        '/js/*': [
          'Cache-Control: public, max-age=31536000, immutable' 
        ],
        '/css/*': [
          'Cache-Control: public, max-age=31536000, immutable'
        ],
        '/fonts/*': [
          'Cache-Control: public, max-age=31536000, immutable'
        ],
        '/images/*': [
          'Cache-Control: public, max-age=31536000, immutable'
        ]
      };

      compilation.assets['_headers'] = {
        source: () => Object.entries(headers)
          .map(([route, rules]) => `${route}\n  ${rules.join('\n  ')}`)
          .join('\n\n'),
        size: () => Object.entries(headers)
          .map(([route, rules]) => route.length + rules.join('').length + rules.length * 2)
          .reduce((total, size) => total + size, 0)
      };
    });
  }
};

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyzeBundle = env && env.analyze;
  
  return {
    mode: isProduction ? 'production' : 'development',
    
    // Entry points for the bundler
    entry: {
      main: './src/js/index.js',
      accessibility: './src/accessibility.js',
      styles: './src/styles/index.js'
    },
    
    // Output configuration
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].bundle.js',
      chunkFilename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].chunk.js',
      clean: true,
      publicPath: './'
    },
    
    // Enable source maps for debugging
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    // Optimization settings
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          common: {
            minChunks: 2,
            name: 'common',
            chunks: 'all',
            priority: 5
          }
        }
      },
      runtimeChunk: 'single',
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
              passes: 2
            },
            mangle: true,
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: isProduction,
              },
            ],
          },
        }),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ['gifsicle', { interlaced: true }],
                ['jpegtran', { progressive: true }],
                ['optipng', { optimizationLevel: 5 }],
                ['svgo', {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          addAttributesToSVGElement: {
                            params: {
                              attributes: [
                                { xmlns: 'http://www.w3.org/2000/svg' },
                              ],
                            },
                          },
                        },
                      },
                    },
                  ],
                }],
              ],
            },
          },
        }),
      ],
    },
    
    // Module rules for processing different file types
    module: {
      rules: [
        // JavaScript processing
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'usage',
                  corejs: 3,
                  modules: false, // Preserve ES modules for tree shaking
                  targets: { 
                    browsers: ['>0.25%', 'not ie 11', 'not op_mini all']
                  }
                }]
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import' // For dynamic imports
              ]
            }
          }
        },
        
        // CSS processing
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true, // Enable CSS modules for files matching .module.css
                  localIdentName: isProduction 
                    ? '[hash:base64:8]' 
                    : '[name]__[local]--[hash:base64:5]'
                },
                importLoaders: 1
              }
            },
            'postcss-loader'
          ]
        },
        
        // Image processing
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8kb - inline if smaller
            }
          },
          generator: {
            filename: 'images/[name].[contenthash:8][ext]'
          }
        },
        
        // Font processing - optimize loading with font-display
        {
          test: /\.(woff|woff2)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash:8][ext]'
          }
        },
        
        // Larger font files that need optimization
        {
          test: /\.(ttf|otf|eot)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: isProduction ? 'fonts/[name].[contenthash:8].[ext]' : 'fonts/[name].[ext]',
                // Exclude these large font files in production
                // We'll use woff/woff2 only in production
                emitFile: !isProduction
              }
            }
          ]
        }
      ]
    },
    
    // Plugins
    plugins: [
      // Clean the output directory before each build
      new CleanWebpackPlugin(),
      
      // Extract CSS into separate files
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/[name].[contenthash:8].css' : 'css/[name].css',
        chunkFilename: isProduction ? 'css/[name].[contenthash:8].css' : 'css/[name].chunk.css'
      }),
      
      // Generate HTML with the bundled assets
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        inject: 'head',
        scriptLoading: 'defer',
        minify: isProduction ? {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true
        } : false,
      }),
      
      // Copy optimized assets for production
      new CopyPlugin({
        patterns: [
          { 
            from: 'src/assets',
            to: 'assets',
            // Skip large font files in production
            filter: (resourcePath) => {
              if (isProduction) {
                return !/\.(ttf|otf|eot)$/.test(resourcePath);
              }
              return true;
            }
          },
          // Copy web optimized fonts only
          { 
            from: 'src/assets/fonts/**/web/*.woff2',
            to: 'assets/fonts/[name][ext]',
          },
          // Copy content files
          {
            from: 'src/content',
            to: 'content',
          }
        ],
      }),
      
      // Add cache control headers in production
      ...(isProduction ? [CacheControlHeadersPlugin] : []),
      
      // Gzip compression for production
      ...(isProduction ? [
        new CompressionPlugin({
          test: /\.(js|css|html|svg|woff|woff2)$/,
          algorithm: 'gzip',
          threshold: 10240, // Only compress assets > 10kb
          minRatio: 0.8,
        })
      ] : []),
      
      // Critical CSS - only for production
      ...(isProduction ? [
        new CriticalCssPlugin({
          base: path.resolve(__dirname, 'dist'),
          src: 'index.html',
          target: 'index.html',
          inline: true,
          extract: false,
          dimensions: [
            {
              width: 375,
              height: 667
            },
            {
              width: 1200,
              height: 800
            }
          ],
          penthouse: {
            blockJSRequests: false,
          }
        })
      ] : []),
      
      // Bundle analyzer - only when requested
      ...(analyzeBundle ? [
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: '../bundle-report.html',
          openAnalyzer: false
        })
      ] : []),
      
      // Include ESLint configuration from config directory
      new ESLintPlugin({
        configFile: './config/.eslintrc.json',
        ignoreFile: './config/.eslintignore'
      })
    ],
    
    // Development server configuration
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      hot: true,
      open: true,
      port: 8082, // Changed to avoid conflicts
      historyApiFallback: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
      },
      // Add better error handling and logging
      client: {
        overlay: {
          errors: true,
          warnings: false
        },
        logging: 'info'
      },
      // Add better error handling for static files
      static: {
        directory: path.join(__dirname, 'dist'),
        publicPath: '/',
        serveIndex: true,
        watch: true
      }
    },
    
    // Resolve configuration for module paths
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@styles': path.resolve(__dirname, 'src/styles')
      }
    }
  };
}; 