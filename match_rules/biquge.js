/**
 * biquge.js Created by xh on 2018-2-12
 * 笔趣阁（http://www.biquge.com.tw/）采集规则
 */
var url = require('url');

const rules = {
    hostname: 'www.biquge.com.tw',
    sitename: '笔趣阁',
    nextlink: null,
    filename: '',
    counter: 0,
    beautify(str){
        return str.replace(/\s*/g, '').replace(/<br[^>]*>/g, '\r\n');
    },
    getNextLink(uri, $cheerio){
        var newUri = new url.URL(uri);
        var pathArr = newUri.pathname.split('/');
        newUri = newUri.protocol + '//' + newUri.hostname + '/' + this.nextlink.attr('href');
        return newUri;
    },
    // @$cheerio 返回的dom对象
    splitConent($cheerio){
        this.counter++;
        if(!this.filename){
            this.filename = $cheerio('.bookname .bottem1 a').eq(2).text();
        }
        this.nextlink = $cheerio('.bookname .bottem1 a').eq(3);
        if(this.nextlink.length < 1){
            return false;
        }
        
        var chapter = $cheerio('.bookname h1').text();
        var content = this.beautify($cheerio('#content').html());

        var txt = chapter + '\r\n\r\n' + content + '\r\n\r\n';
        return {filename: this.filename, txt: txt, counter: this.counter};
    }
}


module.exports = rules;