import electron from 'electron';
const ipcMain = electron.ipcMain;
import { LoggerRef } from '@/log/loggerReference';
const logger = LoggerRef.logger;

import type { MemberRow } from '@/db/memberRow';
import type { MemberIdmRow } from '@/db/memberIdmRow';
import * as IpcServices from '@/main/channel/ipcService';

import { memberListPageServiceMethods } from './memberListServiceMethods';
const methods = memberListPageServiceMethods;

const channel = IpcServices.IpcServiceChannels.MEMBERLIST_CHANNEL_REQUEST;
const replyChannel = IpcServices.IpcServiceChannels.MEMBERLIST_CHANNEL_REPLY;

export function ipcMainMemberListPage() {
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, command:string, ...args:any[])=>{
        console.log('ipcMain.on memberListPage')
        // IDMが紐づいたメンバーを取得する
        if( command == methods.getMemberByFcno.name ){
            const fcno:string = args[0];
            console.log('membersList command=',command)
            const row: MemberRow = await methods.getMemberByFcno(fcno);
            console.log('memberList row=',row);
            event.reply(replyChannel, row);
            return;            
        }
        // IDMが紐づいたメンバーを取得する
        else if( command == methods.getMemberIdmByFcno.name ){
            const fcno:string = args[0];
            const row: MemberIdmRow = await methods.getMemberIdmByFcno(fcno);
            event.reply(replyChannel, row);
            return row;            
        }
        /** 全メンバーを取得する */
        else if(command == methods.getMembers.name){
            const rows = await methods.getMembers();
            event.reply(replyChannel, rows);
            return;
        }
        /** メンバーを追加する */
        else if(command == methods.addMember.name){
            const row:MemberRow = args[0];
            const rslt = await methods.addMember(row);
            event.reply(replyChannel, rslt);
            return;
        }
        /** メンバー情報を変更する */
        else if(command == methods.updateMemberByFcno.name){
            const fcno:string = args[0];
            const row:MemberRow = args[1];
            const rslt = await methods.updateMemberByFcno(fcno, row);
            event.reply(replyChannel, rslt);
            return;
        }
        /** メンバー情報を論理削除する */
        else if(command == methods.deleteMemberByFcno.name){
            const fcno:string = args[0];
            const rslt = await methods.deleteMemberByFcno(fcno);
            event.reply(replyChannel, rslt);
            return;
        }
        logger.error(`comman is not match =(${command})`)
    });
}
