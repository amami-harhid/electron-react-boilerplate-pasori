import * as IpcServices from '@/main/channel/ipcService';
const ipcRenderer = window.electronOAuth2Service.ipcOAuthServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_OAuth_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_OAuth_REPLY;
const CHANNEL_PAGE_REQUEST = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_PAGE_TRANSITION_REQUEST;
const CHANNEL_PAGE_REPLY = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_PAGE_TRANSITION_REPLY;
export const authRendererService = {
    /** 認証 */
    authorization: async function(): Promise<boolean> {
        console.log('authorization send');
        ipcRenderer.authorize(CHANNEL_REQUEST);
        const val = await ipcRenderer.asyncOnce(CHANNEL_REPLY);
        console.log('authorization recieve');
        return val;
    },
    /** ページ遷移 */
    pageTransition: async (page: string) => {
        console.log('====== pageTransition (Renderer)=======', page);
        ipcRenderer.pageTransition(CHANNEL_PAGE_REQUEST, page);
    }
};
