/**
 * webpack.renderer.config.js Created by xh on 2018-2-27
 */
var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        renderer: path.join(__dirname, '../src/renderer/index.js')
    },
    output: {
        path: path.join(__dirname, '../dist/electron'),
        filename: '[name].js',
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
                include: [path.join(__dirname, '../src/renderer/')],
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
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'img/[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css'),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: `html-loader!${path.resolve(__dirname, '../src/index.html')}`,
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
    target: 'electron-renderer'
}