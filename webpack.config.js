var path = require('path');
var webpack = require('webpack'); // 這裡
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

// 定義所有 AJCC 頁面
const ajccPages = [
  'index', 'lung', 'esophagus', 'colon', 'cervix', 'prostate', 'nasopharynx',
  'hcc', 'gastric', 'pancreas', 'gist', 'oropharynx', 'endometrium', 'rcc',
  'oral', 'hypopharynx', 'larynx_supraglottis', 'larynx_glottis',
  'larynx_subglottis', 'ovary', 'urinary_bladder', 'ccc_ibd', 'ccc_pbd',
  'ccc_dbd', 'ogs_trunk', 'ogs_spine', 'ogs_pelvis'
];

// 動態產生 entry points
const entries = ajccPages.reduce((acc, page) => {
  acc[page] = `./src/js/${page}.js`;
  return acc;
}, {});

// 動態產生 HtmlWebpackPlugin 實例
const htmlPlugins = ajccPages.map(page => {
  return new HtmlWebpackPlugin({
    template: `./src/html/ajcc/${page}.html`,
    filename: `${page}.html`,
    chunks: [page],
  });
});

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: entries,

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
    ...htmlPlugins, // 展開所有動態產生的 HtmlWebpackPlugin
    new HtmlWebpackPlugin({
      template: './src/html/nhi_lung_rads.html',
      filename: 'nhi-lung-rads/index.html',
      chunks: [],
    }),
    new FaviconsWebpackPlugin({
      logo: './src/image/favicon.png',
      favicons: {
        appName: null,
        appDescription: null,
        developerName: null,
        developerURL: null,
        background: '#fff',
        theme_color: '#fff',
        manifest: {}, // 不產生 manifest
        icons: {
          android: false, // 關閉 Android
          appleIcon: false, // 關閉 apple-touch-icon
          appleStartup: false, // 關閉 apple-touch-startup-image
          coast: false,
          favicons: true, // 只保留這個
          firefox: false,
          windows: false,
          yandex: false,
        },
      },
    }),
  ],
};
