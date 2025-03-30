/**
 * Webpack Configuration
 * Grimoire
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

module.exports = {
  entry: './src/index.js',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  module: {
    rules: [
      // JavaScript and TypeScript
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      // CSS Modules
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
              importLoaders: 1,
            },
          },
        ],
      },
      // Regular CSS
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}; 