/**
 * main.js Created by xh on 2018-2-1
 */
const {app, BrowserWindow, nativeImage, shell, dialog} = require('electron');
const url = require('url');
const path = require('path');

import {setTray} from './tray'
import {setMenu} from './menu'

import {productName} from '../../package'

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

// 系统托盘、icon的图片
let appIcon = nativeImage.createFromPath(path.join(app.getAppPath(), '../../../../../logo.ico'));
let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 500,
        title: productName,
        icon: appIcon,
        useContentSize: true,
        maximizable: false,
        fullscreenable: false,
        resizable: false
    });
    mainWindow.loadURL(winURL);
    
    // 设置顶部菜单栏
    setMenu(mainWindow);
    // 设置系统托盘菜单
    setTray(mainWindow);

    // mainWindow.openDevTools();

    mainWindow.on('close', (e) => {
        e.preventDefault();
        dialog.showMessageBox(mainWindow, {
            type: 'warning',
            buttons: ['确定', '取消'],
            defaultId: 0,
            title: '提示',
            message: '是否最小化到托盘运行?',
            checkboxLabel: '保存设置',
            checkboxChecked: false,
            cancelId: 1,
            noLink: true,
        }, function(res){
            if(res === 0){
                mainWindow.hide();
            }
            if(res === 1){
                // mainWindow = null;
                app.quit();
            }
        })

    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {

    !appTray.isDestroyed() && appTray.destroy();
});
