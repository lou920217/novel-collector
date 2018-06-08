/**
 * index.js Created by xh on 2018-1-31
 */
var fs = require('fs');
var url = require('url');
var path = require('path');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var http = require('http');
var https = require('https');
var savepath = require('./.config').DOWNLOAD_PATH;
var rules = require('../../../match_rules/');
global.state = false;

let options = {
    site: Object.keys(rules)[0],
    starturl: undefined,
    savepath
};

function request(starturl, cb){
    return new Promise(function(resolve, reject){
        var req = oHttp(starturl).get(starturl, (res) => {
            var data = [];
            var length = 0;
    
            res.on('data', (chunk) => {
                data.push(chunk);
                length += chunk.length;
            });
            res.on('end', () => {
                var dataBuffer = Buffer.concat(data, length);
                resolve(dataBuffer);
                // var temp = iconv.decode(dataBuffer, 'utf8');
                // var $ = cheerio.load(temp);
                // var chartset = $('meta[http-equiv="Content-Type"]').length > 0 ? $('meta[http-equiv="Content-Type"]')[0].attribs['content'].split('=')[1] : $('meta[charset]').length > 0 ? $('meta[charset]')[0].attribs['charset'] : 'utf8';

                // var html = iconv.decode(dataBuffer, chartset);
                // var $$ = cheerio.load(html, {decodeEntities: false});

                // var novel = rules[current_rule].splitConent($$);

                // if(novel){
                //     writeFileTxt(novel.filename, novel.txt, cb).then(() => {
                //         var newUri = rules[current_rule].getNextLink(startUri);
                //         console.log(`${novel.filename} 已经采集${rules[current_rule].counter}章.`);
                //         cb({
                //             filename: rules[current_rule].filename,
                //             counter: rules[current_rule].counter,
                //             starturl: newUri,
                //             savepath: savepath,
                //             site: current_rule,
                //             complete: false
                //         });
                //         !global.state && request({starturl: newUri}, cb);
                //     })
                //     .catch((err) => {
                //         console.log(err);
                //         if(err) throw err;
                //     });
                // }else{
                //     cb({
                //         ilename: rules[current_rule].filename,
                //         counter: rules[current_rule].counter,
                //         complete: true
                //     });
                //     console.log(`${rules[current_rule].filename}采集完成.`);
                // }
            });
        });
        req.on('error', (e) => {
            console.log(e);
            reject(e)
            // throw e;
        });
    })
}
function oHttp(uri){
    var temp = new url.URL(uri);
    var httpObj = null;
    if(temp.protocol == 'http:'){
        httpObj = http;
    }else if(temp.protocol == 'https:'){
        httpObj = https;
    }else{
        throw new Error('暂不支持除http、https之外的协议.');
    }
    return httpObj;
}
function writeFileTxt(filename, txt, cb){
    return new Promise((resolve, reject) => {
        fs.writeFile(options.savepath + filename + '.txt', txt, { encoding: 'utf8', flag: 'a'}, (err) => {
            if(err){
                // if(err.code === 'ENOENT'){
                //     fs.mkdir(savepath, (e) => {
                //         if(e) {
                //             reject(e);
                //             throw e;
                //         }
                //         console.log(`创建${filename}.txt成功.`);
                //         // rules[current_rule].counter = 0;
                //         // request({starturl: startUri}, cb);
                //         resolve('create');
                //     });
                // }else{
                //     reject(err);
                // }
                reject(err);
            }else{
                resolve();
            }
        });
    });
}
function delFile(filename){
    fs.unlink(options.savepath + filename + '.txt', (err) => {
        if (err) throw err;
        console.log(`${options.savepath}${filename}.txt删除成功.`);
    });
}
function getNovel(json, cb){
    options = Object.assign({}, options, json);
    if(!options.starturl) return;
    request(options.starturl)
        .then((res) => {
            var temp = iconv.decode(res, 'utf8');
            var $ = cheerio.load(temp);
            var chartset = $('meta[http-equiv="Content-Type"]').length > 0 ? $('meta[http-equiv="Content-Type"]')[0].attribs['content'].split('=')[1] : $('meta[charset]').length > 0 ? $('meta[charset]')[0].attribs['charset'] : 'utf8';

            var html = iconv.decode(res, chartset);
            var $$ = cheerio.load(html, {decodeEntities: false});

            var novel = rules[options.site].splitConent($$, json);
            cb(novel);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
}
function download(json, cb){
    function wf(novel){
        writeFileTxt(novel.filename, novel.txt)
            .then(state => {
                cb(novel) && getNovel(Object.assign({}, json, {starturl: novel.nextLinkUrl, counter: novel.counter}), wf);
            })
            .catch(err => {
                throw err;
            });
    }
    getNovel(json, wf);
}

module.exports = {
    download(data, cb){
        download(data, cb);
    },
    getNovel(data, cb){
        getNovel(data, cb);
    },
    delFile(filename){
        delFile(filename);
    }
}