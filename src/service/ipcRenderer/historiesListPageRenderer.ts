import * as IpcServices from '@/main/channel/ipcService';
import { HistoriesMemberRow } from '@/db/histories/historiesRow';
import { historiesPageServiceMethods } from '../ipcMain/historiesPageServiceMethods';
const methods = historiesPageServiceMethods;
const ipcRenderer = window.electronService.ipcServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REPLY;

export const historiesPageService = {
    /** 日付を指定して全履歴を取得する */
    getHistoriesByDate: async function(date:Date): Promise<HistoriesMemberRow[]> {
        ipcRenderer.send(CHANNEL_REQUEST, methods.getHistoriesByDate.name, date);    
        const val = await ipcRenderer.asyncOnce<HistoriesMemberRow[]>(CHANNEL_REPLY);
        return val;
    },
};
