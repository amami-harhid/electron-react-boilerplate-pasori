import electron from 'electron';
const ipcMain = electron.ipcMain;
//import { LoggerRef } from '@/log/loggerReference';
//const logger = LoggerRef.logger;

import type { HistoriesMemberIdmRow } from '@/db/historiesRow';

import * as IpcServices from '@/main/channel/ipcService';

import { topPageServiceMethods } from './topPageServiceMethods';
const methods = topPageServiceMethods;
export function ipcMainTopPage(){
    const channel = IpcServices.IpcServiceChannels.TOPPAGE_CHANNEL_REQUEST;
    const replyChannel = IpcServices.IpcServiceChannels.TOPPAGE_CHANNEL_REPLY;
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, command:string, ...args:any[])=>{
        // IDMが紐づいたメンバーを取得する
        if( command == methods.getMemberByIdm.name ){
            const idm:string = args[0];
            const row: HistoriesMemberIdmRow = await methods.getMemberByIdm(idm);
            event.reply(replyChannel, row);
            return;
        }
        /** 入室にする(退室にする) */
        else if(command == methods.setInRoomByFcno.name){
            const fcno:string = args[0];
            const idm:string = args[1];
            const in_room:boolean = args[2];
            const result = await methods.setInRoomByFcno(fcno, idm, in_room);
            event.reply(replyChannel, result);
            return;
        }
        return false;
        //logger.error(`comman is not match =(${command})`)

    });
}
