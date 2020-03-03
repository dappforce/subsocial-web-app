/* eslint-disable @typescript-eslint/no-var-requires */
const withCSS = require('@zeit/next-css');
const withImages = require('next-images');
const withPlugins = require('next-compose-plugins');
const path = require('path')
const Dotenv = require('dotenv-webpack')

// Required by Docker
require('dotenv').config();

// fix: prevents error when .css files are required by node
// if (typeof require !== 'undefined') {
//   require.extensions['.css'] = (file) => {};
// }

const nextConfig = {
  target: 'server',
  webpack: (config, { dev }) => {
    config.module.rules.push({
      test: /\.(raw)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: 'raw-loader'
    });

    return config;
  }
};

module.exports = withPlugins([ withImages, withCSS({
  webpack (config) {

    config.plugins = config.plugins || []

    config.plugins = [
      ...config.plugins,

      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true // Required by Docker
      })
    ]

    config.module.rules.push(
      {
        test: [ /\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/ ],
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/[name].[hash:8].[ext]',
              esModule: false
            }
          }
        ]
      },
      {
        test: [ /\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/ ],
        use: [
          {
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/[name].[hash:8].[ext]',
              esModule: false
            }
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              plugins: () => [
                require('precss'),
                require('autoprefixer'),
                require('postcss-simple-vars'),
                require('postcss-nested'),
                require('postcss-import'),
                require('postcss-clean')(),
                require('postcss-flexbugs-fixes')
              ]
            }
          }
        ]
      })
    return config
  } }) ], nextConfig);
