import * as IpcServices from '@/main/channel/ipcService';
import { HistoriesMemberIdmRow } from '@/db/histories/historiesRow';

import { topPageServiceMethods } from '../ipcMain/topPageServiceMethods';

const ipcRenderer = window.electronService.ipcServiceRenderer;
const ipcMailRenderer = window.electronMailService.ipcMailServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcServiceChannels.TOPPAGE_CHANNEL_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcServiceChannels.TOPPAGE_CHANNEL_REPLY;

const CHANNEL_MAIL_REQUEST = IpcServices.IpcMailServiceChannels.CHANNEL_MAIL_REQUEST;
const CHANNEL_MAIL_REPLY = IpcServices.IpcMailServiceChannels.CHANNEL_MAIL_REPLY;

const methods = topPageServiceMethods;

export const topPageService = {
    /** IDMが紐づいたメンバーを取得する */
    getMemberByIdm: async function(idm:string): Promise<HistoriesMemberIdmRow> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getMemberByIdm.name, idm);
        const val = await ipcRenderer.asyncOnce<HistoriesMemberIdmRow>(CHANNEL_REPLY);
        return val;
    },
    /** 入室にする(退室にする) */
    setInRoomByFcno: async function(fcno:string, idm:string, in_room:boolean): Promise<boolean> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.setInRoomByFcno.name, fcno, idm, in_room);
        const count = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
        return count;
    },
    /** メール送信 */
    sendMail: async function(mail_to:string, in_out:boolean, name:string): Promise<boolean> {
        ipcMailRenderer.send(CHANNEL_MAIL_REQUEST, mail_to, in_out, name);
        const result = await ipcMailRenderer.asyncOnce(CHANNEL_MAIL_REPLY);
        return result;
    },

};
