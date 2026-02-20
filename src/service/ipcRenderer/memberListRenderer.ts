import * as IpcServices from '@/main/channel/ipcService';
import { MemberRow } from '@/db/memberRow';
import { MemberIdmRow } from '@/db/memberIdmRow';
import { memberListPageServiceMethods } from '@/service/ipcMain/memberListServiceMethods';
const methods = memberListPageServiceMethods;
const ipcRenderer = window.electronService.ipcServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcServiceChannels.MEMBERLIST_CHANNEL_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcServiceChannels.MEMBERLIST_CHANNEL_REPLY;

export const memberListService = {
    /** FCNOを指定してメンバーを取り出す */
    getMemberByFcno: async function(fcno:string): Promise<MemberIdmRow> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getMemberIdmByFcno.name, fcno);    
        const val = await ipcRenderer.asyncOnce<MemberIdmRow>(CHANNEL_REPLY);
        return val;
    },
    /** FCNOを指定してメンバー(IDM情報含む）を取り出す */
    getMemberIdmByFcno: async function(fcno:string): Promise<MemberIdmRow> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getMemberIdmByFcno.name, fcno);    
        const val = await ipcRenderer.asyncOnce<MemberIdmRow>(CHANNEL_REPLY);
        return val;
    },
    /** カード情報を取得する */
    getCardInfo: async function(fcno: string): Promise<MemberIdmRow> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getMemberIdmByFcno.name, fcno);
        const val = await ipcRenderer.asyncOnce<MemberIdmRow>(CHANNEL_REPLY);
        return val;
    },
    getMembers: async function(): Promise<MemberIdmRow[]> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getMembers.name);
        const rows = await ipcRenderer.asyncOnce<MemberIdmRow[]>(CHANNEL_REPLY);
        return rows;
    },
    /** メンバーを追加する */
    addMember: async function(row: MemberRow): Promise<boolean> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.addMember.name, row);    
        const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
        return val;
    },
    /** FCNOを指定してメンバーを更新する */
    updateMemberByFcno: async function(fcno: string, row: MemberRow): Promise<boolean> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.updateMemberByFcno.name, fcno, row);    
        const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
        return val;
    },
    /** FCNOを指定してメンバーを論理削除する */
    deleteMemberByFcno: async function(fcno: string): Promise<boolean> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.deleteMemberByFcno.name, fcno);    
        const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
        return val;
    },
};
