var path = require('path');
var webpack = require('webpack'); // 這裡
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    djd_l: './src/djd_l.js',
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
    rules: [
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        },{
          loader: 'expose-loader',
          options: '$'
        }]
      },
      {
        test: require.resolve('clipboard'),
        use: [{
          loader: 'expose-loader',
          options: 'ClipboardJS'
        }]
      },
      {
        test: /djd-l\.js$/,
        use: [ 'script-loader' ]
      },
      {
        test: /\.css$/, // 針對所有.css 的檔案作預處理，這邊是用 regular express 的格式
        use: [
          'style-loader',  // 這個會後執行 (順序很重要)
          'css-loader' // 這個會先執行
        ]
      },
      {
        test: /\.html$/,
        loader: "raw-loader" // loaders: ['raw-loader']，這個方式也是可以被接受的。
      },
    ]
  },

  // https://webpack.js.org/concepts/plugins/
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/html/djd_l.html',
      filename: 'djd_l.html',
    }),
    /*
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
      ClipboardJS: 'clipboard',
    }),
    */
  ],
};