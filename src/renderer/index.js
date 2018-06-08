import './css/style.less';

import $ from 'jquery';
import { shell } from 'electron';
require('bootstrap/dist/js/bootstrap.min');

var path = require('path')
var url = require('url')
var fs = require('fs')
var {remote} = require('electron');
var rules = require('../../match_rules/');
var config = require('./js/.config');
var getnovel = require('./js/getnovel');

(function(){
    init()

    var REGEXP_URL = /((http|https):\/\/)(([a-zA-Z0-9._-]+.[a-zA-Z]{2,6})|([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}))(:[0-9]{1,4})*(\/[a-zA-Z0-9&%_.\/-~-]*)?/;
    var timer = null;

    function init(){

        goHome();

        // 初始化 支持采集网站 下拉框 数据
        for(let [k, v] of Object.entries(rules)){
            var option = document.createElement('option');
            option.value = k;
            option.text = `${v.sitename} (${v.hostname})`;
            $('#collectabledSite').append(option);
        }

        // 默认下载保存路径
        $('#savepath').val(config.DOWNLOAD_PATH);

        $('#startLink').on('input', function(){
            var temp = new Tip({txt: '链接格式不正确！'});
            if(!REGEXP_URL.test($(this).val())){
                temp.init();
            }else{
                temp.close();
            }
        });

        // 自定义下载路径处理函数
        $('#saveAddress').on('change', function(e){
            if(e.target.files.length > 0){
                $('#savepath').val(`${e.target.files[0].path}\\`);
            }
        });
        
        // 提交处理函数
        $('#startCollect').on('click', function(){
            var data = {};
            let form = document.querySelector('form');
            for(let v of form.elements){
                if(!v.name) continue;
                data[v.name] = v.value;
            }
            
            if(!data['site'] && data['site'].trim() == ''){
                new Tip({txt: '请选择将要采集书籍的网站！'}).init();
                return false;
            }

            if(!data['starturl'] && data['starturl'].trim() == ''){
                new Tip({txt: '请选择输入采集书籍的第一章链接！'}).init();
                return false;
            }

            if(!REGEXP_URL.test(data['starturl'])){
                new Tip({txt: '链接格式不正确！'}).init();
                return false;
            }

            var tempState = false;
            for(let v of Object.values(rules)){
                if(data['starturl'].search(v.hostname) !== -1){
                    tempState = true;
                }
            }
            if(!tempState){
                new Tip({txt: '暂不支持该网站的书籍采集！'}).init();
                return false;
            }
            if(data['starturl'].search(rules[data['site']].hostname) === -1){
                new Tip({txt: '输入的书籍首章链接跟所选中的采集网站不匹配！'}).init();
                return false;
            }

            goHistory();
            
            // @data Object site、starturl、savepath  @novel site,starturl,savepath,filename,counter,complete,isExist
            getnovel.getNovel(data, function(novel){
                let temp = Data().getByField('filename', novel.filename);
                let id = 0;
                if(temp){
                    id = temp.id;
                    novel = temp;
                }else{
                    // 先获取id，然后根据id添加数据并存储
                    id = Data().getIdByName(novel.filename);
                }
                let tempNovelFirst = Object.assign({}, data, novel);
                delete tempNovelFirst['txt'];
                Data().updateById(id, tempNovelFirst);
                recordInit();
                getnovel.download(Object.assign({}, data, novel), function(nov){
                    if(!global.state){
                        let tempNovel = Object.assign({}, data, nov);
                        delete tempNovel['txt'];
                        Data().updateById(id, tempNovel);
                        $(`#novel_${id}`).find('.chapter').text(nov.counter);
                        $(`#novel_${id}`).find('.pause').text('暂停');
                        return true;
                    }else{
                        $(`#novel_${id}`).find('.pause').text('继续');
                        return false;
                    }
                    
                });
            });
        });

        // 渲染记录列表
        function recordInit(){
            var data = Data().getAll();
            splitList(data);
        }
        // 跳转首页
        function goHome(){
            $('#index-box').show();
            $('#history-box').hide();
        }
        // 跳转记录页面
        function goHistory(){
            $('#index-box').hide();
            $('#history-box').show();
        }
        recordInit();

        // 暂停，开始
        $('#history-box').on('click', '.pause', function(){
            var id = $(this).parents('tr').attr('id').split('_')[1];
            if($(this).text() == '暂停'){
                global.state  = true;
                $(`#novel_${id}`).find('.pause').text('继续');
            }else if($(this).text() == '继续'){
                global.state = false;
                $(`#novel_${id}`).find('.pause').text('暂停');
                var data = Data().getById(id);
                getnovel.download(Object.assign({}, data), function(nov){
                    if(!global.state){
                        let tempNovel = Object.assign({}, data, nov);
                        delete tempNovel['txt'];
                        Data().updateById(id, tempNovel);
                        $(`#novel_${id}`).find('.chapter').text(nov.counter);
                        $(`#novel_${id}`).find('.pause').text('暂停');
                        return true;
                    }else{
                        $(`#novel_${id}`).find('.pause').text('继续');
                        return false;
                    }
                });
            }else{
                return;
            }
        });

        // 删除
        $('#history-box').on('click', '.delete', function(){
            let filename = $(this).parents('tr').find('td.filename').text();
            Data().removeById($(this).parents('tr').attr('id').split('_')[1]);
            global.state  = true;
            var historys = Data().getAll();
            splitList(historys);
            getnovel.delFile(filename);
        });

        // 清除
        $('#clear').on('click', function(){
            Data().removeAll();
            global.state  = true;
            let $table = $('#records tbody');
            $table.html('');
            let nodata = `<tr id="nodata">
                    <td colspan="4" style="text-align: center;">暂无记录</td>
                </tr>`;
            $table.append(nodata);
        });

        // 跳转历史记录页面
        $('#goHistory').on('click', goHistory);
        // 返回首页
        $('#goHome').on('click', goHome);

        // 检查更新
        $('#update').on('click', function(){
            
        });

        // 打开下载文件所在文件夹
        $('#records').on('click', '.filename', function(){
            var temp = Data().getByField('filename', $(this).text());
            shell.showItemInFolder(`${temp.savepath}${temp.filename}.txt`);
        });
    }

    function Tip(json){
        var tipEle = $('#tooltip-box');
        var contentEle = tipEle.find('span');
        var _this = this;

        _this.init = function(){
            tipEle.addClass('active');
            contentEle.text(json.txt);
            clearTimeout(timer)
            timer = setTimeout(function(){
                _this.close();
            }, 3 * 1000);
        };
        _this.close = function(){
            tipEle.removeClass('active');
        };
    }

    // 数据对象
    function Data(){
        // 通过id获取数据
        Data.getById = function(id){
            return Data.getByField('id', id);
        };
        // 通过某个字段获取数据
        Data.getByField = function(key, value){
            var temp = Data.getAll();
            var tempObj = null;

            for(let v of temp){
                if(v[key] == value){
                    tempObj = v;
                }
            }
            return tempObj;
        };
        // 获取所有数据
        Data.getAll = function(){
            var temp = JSON.parse(localStorage.getItem(config.LOCALSTORAGE_KEY));
            if(!temp){
                temp = [];
            }
            if(Object.prototype.toString.call(temp) !== '[object Array]'){
                throw new Error(`${config.LOCALSTORAGE_KEY}的value数据格式不正确，必须为数组字符串。`);
            }
            return temp;
        };
        // 获取id by filename
        Data.getIdByName = function(filename){
            var temp = Data.getAll();
            var id = 1;
            if(temp.length < 1){
                id = 1;
            }else{
                var isExist = null;
                for(let v of temp){
                    if(v.filename == filename){
                        isExist = v;
                    }
                }
                if(!isExist){
                    id = temp.length;
                }else{
                    id = isExist.id;
                }
            }
            return id;
        };
        // 通过id修改数据
        Data.updateById = function(id, json){
            var temp = Data.getAll();
            var updated = Object.assign(id < 2 ? {id} : temp[id - 1], json);
            temp.splice(id - 1, 1, updated);

            localStorage.setItem(config.LOCALSTORAGE_KEY, JSON.stringify(temp));
        };
        // 通过id删除数据
        Data.removeById = function(id){
            var temp = Data.getAll();
            temp.splice(id - 1, 1);

            localStorage.setItem(config.LOCALSTORAGE_KEY, JSON.stringify(temp));
        };
        // 清空数据
        Data.removeAll = function(){
            localStorage.removeItem(config.LOCALSTORAGE_KEY);
        };
        return Data;
    }

    // 拼接记录列表
    function splitList(data){
        let $table = $('#records tbody');
        $table.html('');

        if(Object.prototype.toString.call(data) !== '[object Array]'){
            throw new Error(`参数data类型错误.`);
        }
        if(data.length < 1){
            let nodata = `<tr id="nodata">
                    <td colspan="4" style="text-align: center;">暂无记录</td>
                </tr>`;

            $table.append(nodata);
            return false;
        }
        data.map((v, k) => {
            let trHtml = `<tr id="novel_${v.id}">
                <td>${(k + 1)}.</td>
                <td class="filename">${v.filename}</td>
                <td>已下载<span class="chapter">${v.counter}</span>章</td>
                <td>
                    <button type="button" class="btn btn-primary btn-xs pause">继续</button>
                    <button type="button" class="btn btn-danger btn-xs delete">删除</button>
                </td>
            </tr>`;

            $table.append(trHtml);
        });
    }

})();
