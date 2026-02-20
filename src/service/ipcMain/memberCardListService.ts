import electron from 'electron';
const ipcMain = electron.ipcMain;
import { LoggerRef } from '@/log/loggerReference';
const logger = LoggerRef.logger;

import type { MemberIdmRow } from '@/db/memberIdmRow';
import * as IpcServices from '@/main/channel/ipcService';

import { memberCardListPageServiceMethods } from './memberCardListServiceMethods';
const methods = memberCardListPageServiceMethods;

const channel = IpcServices.IpcServiceChannels.MEMBERCARDLIST_CHANNEL_REQUEST;
const replyChannel = IpcServices.IpcServiceChannels.MEMBERCARDLIST_CHANNEL_REPLY;

export function ipcMainMemberCardListPage() {
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, command:string, ...args:any[])=>{
        // 登録されたIDMを取得する
        if( command == methods.getIdm.name ){
            const idm:string = args[0];
            const row: MemberIdmRow = await methods.getIdm(idm);
            event.reply(replyChannel, row);
            return;
        }
        // IDMを登録する
        else if( command == methods.setIdmByFcno.name ){
            const fcno:string = args[0];
            const idm:string = args[1];
            const result: boolean = await methods.setIdmByFcno(fcno, idm);
            console.log('memberCardListService setIdmByFcno result=', result);
            event.reply(replyChannel, result);
            return;
        }
        // メンバーを全取得する
        else if( command == methods.getMembers.name ){
            const deletedIncluding:boolean = args[0] as boolean;
            const rows: MemberIdmRow[] = await methods.getMembers(deletedIncluding);
            event.reply(replyChannel, rows);
            return;
        }
        logger.error(`comman is not match =(${command})`)
    });
}
