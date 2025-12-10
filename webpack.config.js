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
  acc[page] = `./src/js/${page}.js`; // Entry key remains the same, but output path will change via filename
  return acc;
}, {});

// 動態產生 HtmlWebpackPlugin 實例
const htmlPlugins = ajccPages.map(page => {
  return new HtmlWebpackPlugin({
    template: `./src/html/ajcc/${page}.html`,
    filename: `ajcc/${page}.html`, // Output to dist/ajcc/
    chunks: [page],
  });
});

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: entries,

  output: {
    // Update JS output path to match the folder structure
    // If chunk name corresponds to an ajcc page, put it in ajcc/ folder
    filename: (pathData) => {
        return ajccPages.includes(pathData.chunk.name) ? 'ajcc/[name].js' : '[name].js';
    },
    path: path.resolve(__dirname, 'dist'),
    // Important: Clean the output directory before emit
    clean: true
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

    // NHI Lung RADS
    new HtmlWebpackPlugin({
      template: './src/html/nhi_lung_rads.html',
      filename: 'nhi-lung-rads/index.html', // Output to dist/nhi-lung-rads/
      chunks: [], // No JS chunks for this page currently based on your previous config
      minify: {
        collapseWhitespace: true, // 保持壓縮空白（選用）
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: false, // [關鍵] 設定為 false，保留 type="text"
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
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