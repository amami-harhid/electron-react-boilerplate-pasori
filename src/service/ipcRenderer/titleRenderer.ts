import * as IpcServices from '@/main/channel/ipcService';

const ipcRenderer = window.electronTitleService.ipcTitleRenderer;
const CHANNEL_REQUEST = IpcServices.IpcTitleServiceChannels.CHANNEL_TITLE_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcTitleServiceChannels.CHANNEL_TITLE_REPLY;

export const titleService = {
    /** タイトルを取得する */
    getTitle: async function(): Promise<string> {
        ipcRenderer.send(CHANNEL_REQUEST);
        const val = await ipcRenderer.asyncOnce<string>(CHANNEL_REPLY);
        return val;
    },
};
