import electron from 'electron';
const ipcMain = electron.ipcMain;
import { LoggerRef } from '@/log/loggerReference';
const logger = LoggerRef.logger;

import type { HistoriesMemberRow } from '@/db/historiesRow';

import * as IpcServices from '@/main/channel/ipcService';

import { historiesPageServiceMethods } from './historiesPageServiceMethods';
const methods = historiesPageServiceMethods;

const CHANNEL_REQUEST = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REPLY;

export function ipcMainHistoriesListPagePage() {

    ipcMain.on(CHANNEL_REQUEST, async(event:Electron.IpcMainEvent, command:string, ...args:any[])=>{
        // IDMが紐づいたメンバーを取得する
        if( command == methods.getHistoriesByDate.name ){
            const date:Date = args[0];
            const rows: HistoriesMemberRow[] = await methods.getHistoriesByDate(date);
            event.reply(CHANNEL_REPLY, rows);
            return;            
        }
        logger.error(`comman is not match =(${command})`)
    });
}