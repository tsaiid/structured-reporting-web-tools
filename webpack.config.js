var path = require('path');
var webpack = require('webpack'); // 這裡
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    djd_l: './src/js/djd_l.js',
    ajcc8_lung: './src/js/ajcc8_lung.js',
    ajcc8_esophagus: './src/js/ajcc8_esophagus.js',
    ajcc8_colon: './src/js/ajcc8_colon.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },

  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    port: 8080,
    contentBase: './dist',
    hot: true,
  },

  module: {
    rules: [{
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/, // 針對所有.css 的檔案作預處理，這邊是用 regular express 的格式
        use: [
          'style-loader', // 這個會後執行 (順序很重要)
          'css-loader' // 這個會先執行
        ]
      },
    ]
  },

  // https://webpack.js.org/concepts/plugins/
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/html/djd_l.html',
      filename: 'djd_l.html',
      chunks: ['djd_l'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/lung.html',
      filename: 'ajcc8_lung.html',
      chunks: ['ajcc8_lung'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/esophagus.html',
      filename: 'ajcc8_esophagus.html',
      chunks: ['ajcc8_esophagus'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/colon.html',
      filename: 'ajcc8_colon.html',
      chunks: ['ajcc8_colon'],
    }),
    new WebappWebpackPlugin({
      logo: './src/image/favicon.png',
      cache: true,
      favicons: {
        icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            coast: false,
            favicons: true,
            firefox: false,
            opengraph: false,
            twitter: false,
            yandex: false,
            windows: false
        }
      }
    }),
  ],
};
