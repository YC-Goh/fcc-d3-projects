
const { merge } = require('webpack-merge');
const common = require('./webpack.com.js');

module.exports = merge(
    common, 
    {
        mode: 'production',
    }
);
