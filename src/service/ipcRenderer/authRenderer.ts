import * as IpcServices from '@/main/channel/ipcService';
const ipcRenderer = window.electronOAuth2Service.ipcOAuthServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_OAuth_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_OAuth_REPLY;
const CHANNEL_PAGE_REQUEST = IpcServices.IpcOAuth2ServiceChannels.CHANNEL_PAGE_TRANSITION_REQUEST;

/** 二重起動回避用 */
const Kick = {
    kick : false,
    counter: 0,
}

export const authRendererService = {
    /** 認証 */
    authorization: async function(): Promise<boolean | null> {
        Kick.counter += 1;
        const _counter = Kick.counter;
        console.log('counter(0)=', _counter);
        if(Kick.kick == false){
            console.log('authorization send');
            Kick.kick = true;
            ipcRenderer.authorize(CHANNEL_REQUEST);
            const val = await ipcRenderer.asyncOnce(CHANNEL_REPLY);
            Kick.kick = false;
            console.log('counter(1)=', _counter);
            console.log('authorization recieve');
            return val;        
        }
        await wait(0.5);
        console.log('counter(2)=', _counter);
        return null;
    },
    /** ページ遷移 */
    pageTransition: async (page: string) => {
        console.log('====== pageTransition (Renderer)=======', page);
        ipcRenderer.pageTransition(CHANNEL_PAGE_REQUEST, page);
    }
};

const wait = (sec:number) => {
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve;
        }, (sec/1000));
    })
}