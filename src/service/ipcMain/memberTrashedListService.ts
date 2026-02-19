import electron from 'electron';
const ipcMain = electron.ipcMain;
import { LoggerRef } from '@/log/loggerReference';
const logger = LoggerRef.logger;

import type { MemberRow } from '@/db/members/memberRow';
import * as IpcServices from '@/main/channel/ipcService';

import { memberTrashedListServiceMethods } from './memberTrashedListServiceMethods';
const methods = memberTrashedListServiceMethods;

const channel = IpcServices.IpcServiceChannels.MEMBERTRUSHED_CHANNEL_REQUEST;
const replyChannel = IpcServices.IpcServiceChannels.MEMBERTRUSHED_CHANNEL_REPLY;

export function ipcMainMemberTrashedListPage() {
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, command:string, ...args:any[])=>{
        console.log('ipcMain.on memberTrashedListPage')
        // 論理削除されたメンバーを取得する
        if( command == methods.getTrashedMembers.name ){
            console.log('----getTrashedMembers----')
            const rows: MemberRow[] = await methods.getTrashedMembers();
            console.log(rows);
            event.reply(replyChannel, rows);
            return;
        }
        /** FCNO指定でメンバーを復活させる */
        else if(command == methods.setRecorverMemberByFcno.name){
            const fcno: string = args[0];
            const rows = await methods.setRecorverMemberByFcno(fcno);
            event.reply(replyChannel, rows);
            return;
        }
        /** メンバー・履歴を完全削除する */
        else if(command == methods.deleteCompletelyByFcno.name){
            const fcno: string = args[0];
            const rslt = await methods.deleteCompletelyByFcno(fcno);
            event.reply(replyChannel, rslt);
            return;
        }
        logger.error(`comman is not match =(${command})`)
    });
}
