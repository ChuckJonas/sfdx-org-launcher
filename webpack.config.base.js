/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
const {
  dependencies: externals
} = require('./app/package.json');

module.exports = {
    module: {
        rules: [
          // typescript
          {
            test: /\.(ts|tsx)$/,
            // include: PATHS.src,
            use:
            [
              {
                loader: 'awesome-typescript-loader',
                options: {
                  useBabel: true,
                  transpileOnly: true,
                  useTranspileModule: false,
                  sourceMap: true,
                },
              },
            ]
          },
          {
            test: /\.css$/,
            // include: PATHS.styles,
            use: [
              { loader: "style-loader" },
              { loader: "css-loader" },
            ]
          },
          //antd
          {
            test: /\.less$/,
            use: [
              { loader: "style-loader" },
              { loader: "css-loader" },
              {
                loader: "less-loader",
                options: {
                  javascriptEnabled: true
                }
              }
            ]
          },
          // images
        // {
        //     test: /\.(jpg|jpeg|png|gif|svg)$/,
        //     // include: [PATHS.assets],
        //     use: {
        //       loader: 'file-loader',
        //       options: {
        //         name: '[path][hash].[ext]',
        //       },
        //     },
        //   },
        //   // fonts
        //   {
        //     test: /\.(woff|woff2|ttf|eot)$/,
        //     // include: [
        //     //   PATHS.assets,
        //     // ],
        //     use: {
        //       loader: 'file-loader',
        //       options: {
        //         name: 'fonts/[name].[hash].[ext]',
        //       },
        //     },
        //   },
        ]
    },
  mode: 'development',
  output: {
    path: path.join(__dirname, 'app'),
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    // libraryTarget: 'es5'
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    modules: [
      path.join(__dirname, 'app'),
      'node_modules',
    ]
  },

  plugins: [],

  externals: Object.keys(externals || {})
};
