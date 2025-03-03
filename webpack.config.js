var path = require('path');
var webpack = require('webpack'); // 這裡
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    'index': './src/js/index.js',
    'lung': './src/js/lung.js',
    'esophagus': './src/js/esophagus.js',
    'colon': './src/js/colon.js',
    'cervix': './src/js/cervix.js',
    'prostate': './src/js/prostate.js',
    'nasopharynx': './src/js/nasopharynx.js',
    'hcc': './src/js/hcc.js',
    'gastric': './src/js/gastric.js',
    'pancreas': './src/js/pancreas.js',
    'gist': './src/js/gist.js',
    'oropharynx': './src/js/oropharynx.js',
    'endometrium': './src/js/endometrium.js',
    'rcc': './src/js/rcc.js',
    'oral': './src/js/oral.js',
    'hypopharynx': './src/js/hypopharynx.js',
    'larynx_supraglottis': './src/js/larynx_supraglottis.js',
    'larynx_glottis': './src/js/larynx_glottis.js',
    'larynx_subglottis': './src/js/larynx_subglottis.js',
    'ovary': './src/js/ovary.js',
    'urinary_bladder': './src/js/urinary_bladder.js',
    'ccc_ibd': './src/js/ccc_ibd.js',
    'ccc_pbd': './src/js/ccc_pbd.js',
    'ccc_dbd': './src/js/ccc_dbd.js',
    'ogs_trunk': './src/js/ogs_trunk.js',
    'ogs_spine': './src/js/ogs_spine.js',
    'ogs_pelvis': './src/js/ogs_pelvis.js',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },

  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    port: 8080,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
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
      template: './src/html/ajcc/lung.html',
      filename: 'lung.html',
      chunks: ['lung'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/esophagus.html',
      filename: 'esophagus.html',
      chunks: ['esophagus'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/colon.html',
      filename: 'colon.html',
      chunks: ['colon'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/cervix.html',
      filename: 'cervix.html',
      chunks: ['cervix'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/prostate.html',
      filename: 'prostate.html',
      chunks: ['prostate'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/nasopharynx.html',
      filename: 'nasopharynx.html',
      chunks: ['nasopharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/hcc.html',
      filename: 'hcc.html',
      chunks: ['hcc'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/gastric.html',
      filename: 'gastric.html',
      chunks: ['gastric'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/pancreas.html',
      filename: 'pancreas.html',
      chunks: ['pancreas'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/gist.html',
      filename: 'gist.html',
      chunks: ['gist'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/oropharynx.html',
      filename: 'oropharynx.html',
      chunks: ['oropharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/endometrium.html',
      filename: 'endometrium.html',
      chunks: ['endometrium'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/rcc.html',
      filename: 'rcc.html',
      chunks: ['rcc'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/oral.html',
      filename: 'oral.html',
      chunks: ['oral'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/hypopharynx.html',
      filename: 'hypopharynx.html',
      chunks: ['hypopharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/larynx_supraglottis.html',
      filename: 'larynx_supraglottis.html',
      chunks: ['larynx_supraglottis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/larynx_glottis.html',
      filename: 'larynx_glottis.html',
      chunks: ['larynx_glottis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/larynx_subglottis.html',
      filename: 'larynx_subglottis.html',
      chunks: ['larynx_subglottis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/ovary.html',
      filename: 'ovary.html',
      chunks: ['ovary'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/urinary_bladder.html',
      filename: 'urinary_bladder.html',
      chunks: ['urinary_bladder'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/ccc_ibd.html',
      filename: 'ccc_ibd.html',
      chunks: ['ccc_ibd'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/ccc_pbd.html',
      filename: 'ccc_pbd.html',
      chunks: ['ccc_pbd'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/ccc_dbd.html',
      filename: 'ccc_dbd.html',
      chunks: ['ccc_dbd'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/ogs_trunk.html',
      filename: 'ogs_trunk.html',
      chunks: ['ogs_trunk'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/ogs_spine.html',
      filename: 'ogs_spine.html',
      chunks: ['ogs_spine'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/ogs_pelvis.html',
      filename: 'ogs_pelvis.html',
      chunks: ['ogs_pelvis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc/index.html',
      filename: 'index.html',
      chunks: ['index'],
    }),
    new FaviconsWebpackPlugin('./src/image/favicon.png'),
  ],
};
