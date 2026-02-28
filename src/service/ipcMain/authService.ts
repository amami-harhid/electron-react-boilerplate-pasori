import electron from 'electron';
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
import * as IpcServices from '@/main/channel/ipcService';
import { authorization } from '@/oauth/authorization';

export function ipcMainAuthorization(){
    const channel = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_OAuth_REQUEST;
    const replyChannel = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_OAuth_REPLY;
    ipcMain.on(channel, async(event:Electron.IpcMainEvent)=>{
        console.log('Authorization main start')
        try{
            authorization();
            console.log('Authorization main success')
            event.reply(replyChannel, true);
        }catch(err){
            console.log('Authorization main error')
            event.reply(replyChannel, false);
        }
    });
}

export function pageTransition() {
    const channel = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_PAGE_TRANSITION_REQUEST;
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, page:string)=>{
        console.log('====== navigate ========', page);
        sendMessage("navigate", page);
    })
}
const sendMessage = (messageId: string, ...args:string[]): void => {
    const browserWindows = BrowserWindow.getAllWindows();
    if( browserWindows.length>0 ) {
        const browserWindow = browserWindows[0];
        browserWindow.webContents.send(messageId, ...args);
    }
}
