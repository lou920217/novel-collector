/**
 * webpack.web.express.config.js Created by xh on 2018-2-26
 */
var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        web: path.join(__dirname, '../app/renderer/index.js')
    },
    output: {
        path: path.join(__dirname, '../dist/web'),
        filename: '[name].js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'postcss-loader', 'less-loader'],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                include: [path.join(__dirname, '../app/renderer/')],
                exclude: /node_modules/
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                  loader: 'url-loader',
                  query: {
                    limit: 10000,
                    name: 'fonts/[name].[ext]'
                  }
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css'),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../app/index.html'),
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        extensions: ['.js', '.css', '.less', '.json']
    },
    target: 'web'
}