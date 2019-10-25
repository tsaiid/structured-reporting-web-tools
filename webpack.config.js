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
    ajcc8_cervix: './src/js/ajcc8_cervix.js',
    ajcc8_prostate: './src/js/ajcc8_prostate.js',
    ajcc8_nasopharynx: './src/js/ajcc8_nasopharynx.js',
    ajcc8_hcc: './src/js/ajcc8_hcc.js',
    ajcc8_gastric: './src/js/ajcc8_gastric.js',
    ajcc8_pancreas: './src/js/ajcc8_pancreas.js',
    ajcc8_gist: './src/js/ajcc8_gist.js',
    ajcc8_oropharynx: './src/js/ajcc8_oropharynx.js',
    ajcc8_endometrium: './src/js/ajcc8_endometrium.js',
    ajcc8_rcc: './src/js/ajcc8_rcc.js',
    ajcc8_oral: './src/js/ajcc8_oral.js',
    ajcc8_hypopharynx: './src/js/ajcc8_hypopharynx.js',
    ajcc8_larynx_supraglottis: './src/js/ajcc8_larynx_supraglottis.js',
    ajcc8_larynx_glottis: './src/js/ajcc8_larynx_glottis.js',
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
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/cervix.html',
      filename: 'ajcc8_cervix.html',
      chunks: ['ajcc8_cervix'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/prostate.html',
      filename: 'ajcc8_prostate.html',
      chunks: ['ajcc8_prostate'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/nasopharynx.html',
      filename: 'ajcc8_nasopharynx.html',
      chunks: ['ajcc8_nasopharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/hcc.html',
      filename: 'ajcc8_hcc.html',
      chunks: ['ajcc8_hcc'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/gastric.html',
      filename: 'ajcc8_gastric.html',
      chunks: ['ajcc8_gastric'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/pancreas.html',
      filename: 'ajcc8_pancreas.html',
      chunks: ['ajcc8_pancreas'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/gist.html',
      filename: 'ajcc8_gist.html',
      chunks: ['ajcc8_gist'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/oropharynx.html',
      filename: 'ajcc8_oropharynx.html',
      chunks: ['ajcc8_oropharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/endometrium.html',
      filename: 'ajcc8_endometrium.html',
      chunks: ['ajcc8_endometrium'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/rcc.html',
      filename: 'ajcc8_rcc.html',
      chunks: ['ajcc8_rcc'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/oral.html',
      filename: 'ajcc8_oral.html',
      chunks: ['ajcc8_oral'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/hypopharynx.html',
      filename: 'ajcc8_hypopharynx.html',
      chunks: ['ajcc8_hypopharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/larynx_supraglottis.html',
      filename: 'ajcc8_larynx_supraglottis.html',
      chunks: ['ajcc8_larynx_supraglottis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/larynx_glottis.html',
      filename: 'ajcc8_larynx_glottis.html',
      chunks: ['ajcc8_larynx_glottis'],
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
