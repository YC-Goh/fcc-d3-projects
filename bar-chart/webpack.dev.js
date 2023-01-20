
const { merge } = require('webpack-merge');
const common = require('./webpack.com.js');

module.exports = merge(
    common, 
    {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
          static: './page',
        },
        optimization: {
          runtimeChunk: 'single',
        },
    }
);
