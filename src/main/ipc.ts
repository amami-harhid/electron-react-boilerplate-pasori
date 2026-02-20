import { ipcMain, type IpcMainEvent } from 'electron';

/** 本番環境を把握する通信(Sound関係で使用する) */
export const  ipc_is_production = ( is_production:boolean ) => {
  const Channel = "IS_PRODUCTION";
  ipcMain.on(Channel, async(event:IpcMainEvent)=>{
      event.reply(Channel, is_production);
  });
}
/** Assetsパスを取得する通信(Sound関係で使用する) */
export const  ipc_assets_path = ( assets_path: string ) => {
  const Channel = "ASSETS_PATH";
  ipcMain.on(Channel, async(event:IpcMainEvent)=>{
      event.reply(Channel, assets_path);
  });
}
