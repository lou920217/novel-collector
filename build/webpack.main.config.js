/**
 * webpack.main.config.js Created by xh on 2018-2-27
 */
var path = require('path')
var webpack = require('webpack')

module.exports = {
    entry: {
        main: path.join(__dirname, '../src/main/main.js')
    },
    output: {
        path: path.join(__dirname, '../dist/electron'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.css', '.less', '.json']
    },
    target: 'electron-main'
}