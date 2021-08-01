var path = require('path');
var webpack = require('webpack'); // 這裡
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: {
    'djd_l': './src/js/djd_l.js',
    'ajcc8/index': './src/js/ajcc8_index.js',
    'ajcc8/lung': './src/js/ajcc8_lung.js',
    'ajcc8/esophagus': './src/js/ajcc8_esophagus.js',
    'ajcc8/colon': './src/js/ajcc8_colon.js',
    'ajcc8/cervix': './src/js/ajcc8_cervix.js',
    'ajcc8/prostate': './src/js/ajcc8_prostate.js',
    'ajcc8/nasopharynx': './src/js/ajcc8_nasopharynx.js',
    'ajcc8/hcc': './src/js/ajcc8_hcc.js',
    'ajcc8/gastric': './src/js/ajcc8_gastric.js',
    'ajcc8/pancreas': './src/js/ajcc8_pancreas.js',
    'ajcc8/gist': './src/js/ajcc8_gist.js',
    'ajcc8/oropharynx': './src/js/ajcc8_oropharynx.js',
    'ajcc8/endometrium': './src/js/ajcc8_endometrium.js',
    'ajcc8/rcc': './src/js/ajcc8_rcc.js',
    'ajcc8/oral': './src/js/ajcc8_oral.js',
    'ajcc8/hypopharynx': './src/js/ajcc8_hypopharynx.js',
    'ajcc8/larynx_supraglottis': './src/js/ajcc8_larynx_supraglottis.js',
    'ajcc8/larynx_glottis': './src/js/ajcc8_larynx_glottis.js',
    'ajcc8/larynx_subglottis': './src/js/ajcc8_larynx_subglottis.js',
    'ajcc8/ovary': './src/js/ajcc8_ovary.js',
    'ajcc8/urinary_bladder': './src/js/ajcc8_urinary_bladder.js',
    'ajcc8/ccc_ibd': './src/js/ajcc8_ccc_ibd.js',
    'ajcc8/ccc_pbd': './src/js/ajcc8_ccc_pbd.js',
    'ajcc8/ccc_dbd': './src/js/ajcc8_ccc_dbd.js',
    'ajcc8/ogs_trunk': './src/js/ajcc8_ogs_trunk.js',
    'ajcc8/ogs_spine': './src/js/ajcc8_ogs_spine.js',
    'ajcc8/ogs_pelvis': './src/js/ajcc8_ogs_pelvis.js',
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
      filename: 'ajcc8/lung.html',
      chunks: ['ajcc8/lung'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/esophagus.html',
      filename: 'ajcc8/esophagus.html',
      chunks: ['ajcc8/esophagus'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/colon.html',
      filename: 'ajcc8/colon.html',
      chunks: ['ajcc8/colon'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/cervix.html',
      filename: 'ajcc8/cervix.html',
      chunks: ['ajcc8/cervix'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/prostate.html',
      filename: 'ajcc8/prostate.html',
      chunks: ['ajcc8/prostate'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/nasopharynx.html',
      filename: 'ajcc8/nasopharynx.html',
      chunks: ['ajcc8/nasopharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/hcc.html',
      filename: 'ajcc8/hcc.html',
      chunks: ['ajcc8/hcc'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/gastric.html',
      filename: 'ajcc8/gastric.html',
      chunks: ['ajcc8/gastric'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/pancreas.html',
      filename: 'ajcc8/pancreas.html',
      chunks: ['ajcc8/pancreas'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/gist.html',
      filename: 'ajcc8/gist.html',
      chunks: ['ajcc8/gist'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/oropharynx.html',
      filename: 'ajcc8/oropharynx.html',
      chunks: ['ajcc8/oropharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/endometrium.html',
      filename: 'ajcc8/endometrium.html',
      chunks: ['ajcc8/endometrium'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/rcc.html',
      filename: 'ajcc8/rcc.html',
      chunks: ['ajcc8/rcc'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/oral.html',
      filename: 'ajcc8/oral.html',
      chunks: ['ajcc8/oral'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/hypopharynx.html',
      filename: 'ajcc8/hypopharynx.html',
      chunks: ['ajcc8/hypopharynx'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/larynx_supraglottis.html',
      filename: 'ajcc8/larynx_supraglottis.html',
      chunks: ['ajcc8/larynx_supraglottis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/larynx_glottis.html',
      filename: 'ajcc8/larynx_glottis.html',
      chunks: ['ajcc8/larynx_glottis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/larynx_subglottis.html',
      filename: 'ajcc8/larynx_subglottis.html',
      chunks: ['ajcc8/larynx_subglottis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/ovary.html',
      filename: 'ajcc8/ovary.html',
      chunks: ['ajcc8/ovary'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/urinary_bladder.html',
      filename: 'ajcc8/urinary_bladder.html',
      chunks: ['ajcc8/urinary_bladder'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/ccc_ibd.html',
      filename: 'ajcc8/ccc_ibd.html',
      chunks: ['ajcc8/ccc_ibd'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/ccc_pbd.html',
      filename: 'ajcc8/ccc_pbd.html',
      chunks: ['ajcc8/ccc_pbd'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/ccc_dbd.html',
      filename: 'ajcc8/ccc_dbd.html',
      chunks: ['ajcc8/ccc_dbd'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/ogs_trunk.html',
      filename: 'ajcc8/ogs_trunk.html',
      chunks: ['ajcc8/ogs_trunk'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/ogs_spine.html',
      filename: 'ajcc8/ogs_spine.html',
      chunks: ['ajcc8/ogs_spine'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/ogs_pelvis.html',
      filename: 'ajcc8/ogs_pelvis.html',
      chunks: ['ajcc8/ogs_pelvis'],
    }),
    new HtmlWebpackPlugin({
      template: './src/html/ajcc8/index.html',
      filename: 'ajcc8/index.html',
      chunks: ['ajcc8/index'],
    }),
    new FaviconsWebpackPlugin('./src/image/favicon.png'),
  ],
};
