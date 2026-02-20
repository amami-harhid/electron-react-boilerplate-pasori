import * as IpcServices from '@/main/channel/ipcService';
import { IdmRow } from '@/db/idmRow';
import { MemberIdmRow } from '@/db/memberIdmRow';
import { memberCardListPageServiceMethods } from '@/service/ipcMain/memberCardListServiceMethods';
const methods = memberCardListPageServiceMethods;
const ipcRenderer = window.electronService.ipcServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcServiceChannels.MEMBERCARDLIST_CHANNEL_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcServiceChannels.MEMBERCARDLIST_CHANNEL_REPLY;

export const memberCardListService = {
    /** 登録されたIDMを取得する */
    getIdm: async function(idm:string): Promise<IdmRow> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getIdm.name, idm);
        const row = await ipcRenderer.asyncOnce<IdmRow>(CHANNEL_REPLY);
        return row;
    },
    /** FCNO指定でIDMを更新する */
    setIdmByFcno: async function(fcno:string, idm:string): Promise<boolean> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.setIdmByFcno.name, fcno, idm);
        const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
        return val;
    },
    /** 全メンバーを取得する */
    getMembers: async function(deletedIncluding:boolean=false): Promise<MemberIdmRow[]> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getMembers.name, deletedIncluding);
        const val = await ipcRenderer.asyncOnce<MemberIdmRow[]>(CHANNEL_REPLY);
        return val;
    },
};
