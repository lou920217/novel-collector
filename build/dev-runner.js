/**
 * dev-runner.js Created by xh on 2018-2-12
 */
var express = require('express')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackDevServer = require('webpack-dev-server')
var webpackHotMiddleware = require('webpack-hot-middleware')

const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { say } = require('cfonts')
const { spawn } = require('child_process')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

let electronProcess = null
let manualRestart = false
var hotMiddleware

function logStats (proc, data) {
    let log = ''
  
    log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
    log += '\n\n'
  
    if (typeof data === 'object') {
        data.toString({
            colors: true,
            chunks: false
        }).split(/\r?\n/).forEach(line => {
            log += '  ' + line + '\n'
        })
    } else {
        log += `  ${data}\n`
    }
  
    log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'
  
    console.log(log)
}

function startRenderer(){
    return new Promise(function(resolve, reject){
        rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer);

        var compiler = webpack(rendererConfig);

        // var devMiddleware = webpackDevMiddleware(compiler, {
        //     noInfo: true,
        //     publicPath: rendererConfig.output.publicPath
        // });
        hotMiddleware = webpackHotMiddleware(compiler, {
            heartbeat: 2500
        });

        // 当html-webpack-plugin的template发生变化时，发布reload action
        compiler.plugin('compilation', compilation => {
            compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
                hotMiddleware.publish({ action: 'reload' })
                cb()
            })
        })

        compiler.plugin('done', stats => {
            logStats('Renderer', stats)
        });

        var server = new webpackDevServer(compiler, {
            contentBase: path.join(__dirname, '../'),
            before(app, ctx){
                app.use(hotMiddleware)
                ctx.middleware.waitUntilValid(() => {
                    resolve()
                })
            }
        })

        server.listen(9080)

        // var app = express();

        // app.use(hotMiddleware);
        // app.use(devMiddleware);

        // devMiddleware.waitUntilValid(() => {
        //     resolve()
        // })

        // app.listen(9080, function(){
        //     console.log('app listening on port 9080.\n');
        // });
    });
}

function startMain(){
    return new Promise(function(resolve, reject){
        mainConfig.entry.main = [path.join(__dirname, '../src/main/main.dev')].concat(mainConfig.entry.main);

        var compiler = webpack(mainConfig)

        compiler.plugin('watch-run', (compilation, done) => {
            logStats('Main', chalk.white.bold('compiling...'))
            hotMiddleware.publish({action: 'compiling'})
            done()
        })

        compiler.watch({}, (err, stats) => {
            if(err){
                console.log(err);
                return
            }

            logStats('Main', stats)

            if(electronProcess && electronProcess.kill){
                manualRestart = true
                process.kill(electronProcess.pid)
                electronProcess = null

                startElectron()
                setTimeout(() => {
                    manualRestart = false
                }, 5000)
            }
            resolve()
        })
    })
}

function startElectron(){
    electronProcess = spawn(electron, [path.join(__dirname, '../dist/electron/main.js')])
    electronProcess.stdout.on('data', data => {
        electronLog(data, 'blue')
    })
    electronProcess.stderr.on('data', data => {
        electronLog(data, 'red')
    })
    electronProcess.on('close', () => {
        if(!manualRestart) process.exit()
    })
}

function electronLog (data, color) {
    let log = ''
    data = data.toString().split(/\r?\n/)
    data.forEach(line => {
        log += `  ${line}\n`
    })
    if (/[0-9A-z]+/.test(log)) {
        console.log(
            chalk[color].bold('┏ Electron -------------------') +
            '\n\n' +
            log +
            chalk[color].bold('┗ ----------------------------') +
            '\n'
        )
    }
}

function greeting () {
    const cols = process.stdout.columns
    let text = ''
  
    if (cols > 104) text = 'electron-vue'
    else if (cols > 76) text = 'electron-|vue'
    else text = false
  
    if (text) {
        say(text, {
            colors: ['yellow'],
            font: 'simple3d',
            space: false
        })
    } else console.log(chalk.yellow.bold('\n  electron-vue'))
    console.log(chalk.blue('  getting ready...') + '\n')
}

function init(){
    greeting()

    Promise.all([startRenderer(), startMain()])
        .then(() => {
            startElectron()
        })
        .catch(err => {
            console.error(err)
        })
}

init()