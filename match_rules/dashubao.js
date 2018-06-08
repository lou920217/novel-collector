/**
 * dashubao.js Created by xh on 2018-2-12
 * 大书包（http://www.dashubao.net/）采集规则
 */
var url = require('url');

const rules = {
    hostname: 'www.dashubao.net',
    sitename: '大书包',
    beautify(str){
        return str.replace(/<p[^>]*>/g, '').replace(/\s*/g, '').replace(/<\/p[^>]*>/g, '\r\n');
    },
    getNextLink(uri, $cheerio){
        if(uri.constructor.name !== 'String'){
            $cheerio = uri;
        }
        var newUri = uri.attr('href');
        return newUri;
    },
    // @$cheerio 返回的dom对象
    splitConent($cheerio, json){
        let counter = json.counter || 0,
            filename = '',
            nextLinkUrl = '';
        counter++;
        if(!filename || filename.trim() === ''){
            filename = $cheerio('.read_t a:nth-child(3)').text();
        }
        let nextLink = $cheerio('.pereview').eq(1).find('#next_page');
        nextLinkUrl = nextLink.length > 0 ? this.getNextLink(nextLink) : '';
        if(nextLinkUrl.trim() == ''){
            return false;
        }
        
        var chapter = $cheerio('.novel .oneline').text();
        var content = this.beautify($cheerio('.yd_text2').html());

        var txt = chapter + '\r\n\r\n' + content + '\r\n\r\n';
        return {filename, txt, counter, nextLinkUrl};
    }
}

module.exports = rules;