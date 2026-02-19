import electron from 'electron';
const ipcMain = electron.ipcMain;
import * as IpcServices from '@/main/channel/ipcService';
import { titleServiceMethods } from './titleServiceMethods';

export function ipcMainTitle(){
    const channel = IpcServices.IpcTitleServiceChannels.CHANNEL_TITLE_REQUEST;
    const replyChannel = IpcServices.IpcTitleServiceChannels.CHANNEL_TITLE_REPLY;
    ipcMain.on(channel, async(event:Electron.IpcMainEvent)=>{
        
        const title = titleServiceMethods.getTitle();
        event.reply(replyChannel, title);

    });
}
