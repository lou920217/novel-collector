/**
 * menu.js Created by xh on 2018-5-29
 */
import {Menu, shell} from 'electron'

// 设置顶部菜单
const menuTemplate = [
    {
        label: '任务',
        submenu: [
            {label: '采集记录'},
            {label: '退出', role: 'close'}
        ]
    },
    {
        label: '帮助',
        submenu: [
            {
                label: '检测更新', 
                click(){
                    shell.openExternal('http://baidu.com/')
                }
            },
            { type: 'separator' },
            {
                label: '关于', 
                click(){
                    shell.openExternal('http://baidu.com/')
                }
            }
        ]
    }
]
const topMenu = Menu.buildFromTemplate(menuTemplate);
export function setMenu(mainWindow){
    // 设置顶部菜单栏
    Menu.setApplicationMenu(topMenu);
}
