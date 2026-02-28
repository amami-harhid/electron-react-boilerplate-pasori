import { contextBridge, ipcRenderer } from 'electron';
import * as IpcServices from '@/main/channel/ipcService';
import {CardReaderID } from '@/icCard/cardEventID';
export type Channels = IpcServices.IpcChannelValOfService;
export type ServiceChannels = IpcServices.IpcServiceChannelValOfService;
export type ServiceMailChannels = IpcServices.IpcMailServiceChannelsValOfService;
export type ServiceTitleChannels = IpcServices.IpcTitleServiceChannelsValOfServie;
export type IpcOAuth2ServiceChannelsValOfService = IpcServices.IpcOAuth2ServiceChannelsValOfService;

const electronServiceHandler = {
  ipcServiceRenderer: {
    send(channel: ServiceChannels, methodName:string, ...args: unknown[]) {
      ipcRenderer.send(channel, methodName, ...args);
    },
    asyncOnce<T>(channel: ServiceChannels):Promise<T> {
      return new Promise<T>( (resolve)=>{
        ipcRenderer.once(channel, (_event, arg:T) => {
            resolve(arg);
        })
      });
    },
  },
};
const electronTitleServiceHandler = {
  ipcTitleRenderer: {
    send(channel: ServiceTitleChannels) {
      ipcRenderer.send(channel);
    },
    asyncOnce<T>(channel: ServiceTitleChannels):Promise<T> {
      return new Promise<T>( (resolve)=>{
        ipcRenderer.once(channel, (_event, title:T) => {
            console.log('main asyncOnce title=', title);
            resolve(title);
        })
      });
    },
  },
};
const electronNavigate = {
  onNavigate: (callback:CallableFunction) => {
    ipcRenderer.on("navigate", (_, path) => {
      callback(path)
    })
  },
};
const electronPasoriCard = {
  onTouch: (callback:CallableFunction) => {
    const f = async(event:Electron.IpcRendererEvent, idm:string) => {
      await callback(idm);
    }
    ipcRenderer.removeAllListeners(CardReaderID.CARD_TOUCH);
    ipcRenderer.on( CardReaderID.CARD_TOUCH, f);
  },
  onRelease: (callback:CallableFunction) => {
    ipcRenderer.removeAllListeners(CardReaderID.CARD_RELEASE);
    ipcRenderer.on( CardReaderID.CARD_RELEASE, async(_, idm) => {
      await callback(idm);
    })
  },
  isCardReady: async () => {
      ipcRenderer.send( CardReaderID.ListenCardIsReady);
      return new Promise<boolean>( (resolve)=>{
        ipcRenderer.once(CardReaderID.ListenCardIsReady, (_event, ready:boolean) => {
            resolve(ready);
        })
      });
  },
  /** force=trueの場合はリーダー再起動をする */
  startReader: (force:boolean=false)=> {
    console.log('In Preload startReader! ');
    ipcRenderer.send( CardReaderID.CARD_READER_START, force);
  },
  /** リーダーのREADY(接続完了)状態を検知する */
  readerOnReady: (callback:CallableFunction) => {
    ipcRenderer.on( CardReaderID.CARD_READER_READY, (_) => {
        callback();
    })
  },
  /** リーダーのREADY(切断された)状態を検知する */
  readerOnEnd: (callback:CallableFunction) => {
    ipcRenderer.on( CardReaderID.CARD_READER_END, (_) => {
        callback();
    })
  },
  /** リーダーにエラーが発生したことを検知する */
  readerOnError: (callback:CallableFunction) => {
    ipcRenderer.on( CardReaderID.CARD_READER_ERROR, (_) => {
        callback();
    })
  },
};

/** メーラーサービス */
const electronMailServiceHandler = {
  ipcMailServiceRenderer: {
    /** メール送信 */
    send(channel: ServiceMailChannels, mail_to:string, in_out:boolean, name:string) {
      ipcRenderer.send(channel, mail_to, in_out, name);
    },
    /** メール送信結果を検知 */
    asyncOnce(channel: ServiceMailChannels):Promise<boolean> {
      return new Promise<boolean>( (resolve)=>{
        ipcRenderer.once(channel, (_event, result:boolean) => {
            resolve(result);
        })
      });
    },
  },
};

/** 認証サービス */
const electronOAuthServiceHandler = {
  ipcOAuthServiceRenderer: {
    /** 認証 */
    authorize(channel: IpcOAuth2ServiceChannelsValOfService) {
      ipcRenderer.send(channel);
    },
    /** 認証結果を検知 */
    asyncOnce(channel: IpcOAuth2ServiceChannelsValOfService):Promise<boolean> {
      return new Promise<boolean>( (resolve)=>{
        ipcRenderer.once(channel, (_event, result:boolean) => {
            resolve(result);
        })
      });
    },
    pageTransition(channel: IpcOAuth2ServiceChannelsValOfService, page:string) {
        console.log('====== preload pageTransition ====', channel, page);
        ipcRenderer.send(channel, page);
    },
  },
};

//contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('navigate', electronNavigate);
contextBridge.exposeInMainWorld('pasoriCard', electronPasoriCard);
contextBridge.exposeInMainWorld('electronService', electronServiceHandler);
contextBridge.exposeInMainWorld('electronMailService', electronMailServiceHandler);
contextBridge.exposeInMainWorld('electronOAuth2Service', electronOAuthServiceHandler);
contextBridge.exposeInMainWorld('electronTitleService', electronTitleServiceHandler);

const buildEnv = {
    isProduction : (): Promise<boolean> => {
        const Channel = "IS_PRODUCTION";
        ipcRenderer.send( Channel );
        return new Promise<boolean>((resolve)=>{
            ipcRenderer.once( Channel, (_event, isProduction:boolean) => {
                resolve(isProduction);
            })
        });
    },
    getAssetsPath: (): Promise<string> => {
        const Channel = "ASSETS_PATH";
        ipcRenderer.send( Channel );
        return new Promise<string>((resolve)=>{
            ipcRenderer.once( Channel, (_event, assetsPath:string) => {
                resolve(assetsPath);
            })
        });
    }
}

contextBridge.exposeInMainWorld('buildEnv', buildEnv);



//export type ElectronHandler = typeof electronHandler;
export type ElectronNavigate = typeof electronNavigate;
export type ElectronPasoriCard = typeof electronPasoriCard;
export type ElectronServiceHandler = typeof electronServiceHandler;
export type ElectronMailServiceHandler = typeof electronMailServiceHandler;
export type ElectronOAuth2ServiceHandler = typeof electronOAuthServiceHandler;
export type ElectronTitleServiceHandler = typeof electronTitleServiceHandler;
export type ElectronProduct = typeof buildEnv;
//export type ElectronPasoriDb = typeof electronPasoriDb;
