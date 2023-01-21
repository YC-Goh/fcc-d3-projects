
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  context: path.resolve(__dirname),
  devtool: 'inline-source-map',
  devServer: {
    static: './page',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'page'),
  },
  plugins: [new HtmlWebpackPlugin({'title': 'Bar Chart Project', 'template': './app/index.html'})],
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.m?js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }]
            ],
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.html$/i,
        exclude: /node_modules/,
        use: ['html-loader'],
      },
    ],
  },
  optimization: {
    runtimeChunk: 'single',
  },
};
