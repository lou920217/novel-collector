/**
 * tray.js Created by xh on 2018-5-29
 */
const {Menu, app, nativeImage, Tray} = require('electron')
const path = require('path')

let appTray = null;
let appIcon = nativeImage.createFromPath(path.join(app.getAppPath(), '../../../../../logo.ico'));

export function setTray(mainWindow){
    // 设置系统托盘菜单
    const trayMenu = Menu.buildFromTemplate([
        { label: '进入主界面', click: mainWindowShow},
        { type: 'separator' },
        { label: '退出', role: 'quit'}
    ]);

    // 显示主界面
    function mainWindowShow(){
        if(mainWindow){
            mainWindow.show();
        }
    }

    // 设置系统托盘菜单
    appTray = new Tray(appIcon)
    appTray.setContextMenu(trayMenu);

    appTray.on('click', () => {
        mainWindowShow();
    })
}