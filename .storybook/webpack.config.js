const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
module.exports = ({ config }) => {

config.module.rules.push(

  // Loader for static files managed by Next.js
  {
    test: /\.(png|svg|eot|otf|ttf|woff|woff2)$/,
    use: {
      loader: 'url-loader',
      options: {
        limit: 8192,
        publicPath: '/_next/static/',
        outputPath: 'static/',
        name: '[name].[ext]'
      }
    }
  },

  // Post CSS loader for sources:
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
  },

  // TypeScript loader
  {
    test: /\.(ts|tsx)$/,
    exclude: /(node_modules)/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: require('@polkadot/dev-react/config/babel')
      },
    ],
  }
);

config.resolve.extensions.push('.ts', '.tsx');

// TSConfig, uses the same file as packages
config.resolve.plugins = config.resolve.plugins || [];
config.resolve.plugins.push(
  new TsconfigPathsPlugin({
    configFile: path.resolve(__dirname, '../tsconfig.json'),
  })
);

// Stories parser
config.module.rules.push({
    test: /\.stories\.tsx?$/,
    loaders: [require.resolve('@storybook/source-loader')],
    enforce: 'pre',
});

return config;
};
