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

// Add Landing Page Entry
entries['landing'] = './src/js/landing.js';
entries['nhi_lung_rads'] = './src/js/nhi_lung_rads.js';

// 動態產生 HtmlWebpackPlugin 實例
const htmlPlugins = ajccPages.map(page => {
  return new HtmlWebpackPlugin({
    template: `./src/html/ajcc/${page}.html`,
    filename: `ajcc/${page}.html`, // Output to dist/ajcc/
    chunks: ['vendors', 'common', page],
  });
});

module.exports = {

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  entry: entries,

  output: {
    // Update JS output path to match the folder structure
    // If chunk name corresponds to an ajcc page, put it in ajcc/ folder
    // Otherwise, put it in assets/js/ (for vendors and common)
    filename: (pathData) => {
      // Use [contenthash] for better caching
      return ajccPages.includes(pathData.chunk.name) ? 'ajcc/[name].[contenthash].js' : 'assets/js/[name].[contenthash].js';
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
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        common: {
          test: /[\\/]src[\\/]js[\\/](common|ajcc_common)\.js/,
          name: 'common',
          chunks: 'all',
          priority: 10,
          enforce: true,
        },
      },
    },
  },

  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
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
      test: /\.html$/i,
      include: path.resolve(__dirname, 'src/html/partials'),
      loader: "html-loader",
    },
    {
      test: /\.css$/, // 針對所有.css 的檔案作預處理，這邊是用 regular express 的格式
      use: [
        'style-loader', // 這個會後執行 (順序很重要)
        'css-loader' // 這個會先執行
      ]
    },
    {
      test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'assets/images/[name][ext][query]'
      }
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
      chunks: ['nhi_lung_rads'],
    }),

    // Landing Page
    new HtmlWebpackPlugin({
      template: './src/html/landing.html',
      filename: 'index.html', // Output to dist/index.html
      chunks: ['landing'],
    }),

    new FaviconsWebpackPlugin({
      logo: './src/image/favicon.png',
      prefix: 'assets/images/',
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
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
};