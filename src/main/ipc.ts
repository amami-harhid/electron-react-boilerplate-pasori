import { ipcMain, type IpcMainEvent } from 'electron';

export const  ipc_is_production = ( is_production:boolean ) => {
  const Channel = "IS_PRODUCTION";
  ipcMain.on(Channel, async(event:IpcMainEvent)=>{
      event.reply(Channel, is_production);
  });
}
export const  ipc_assets_path = ( assets_path: string ) => {
  const Channel = "ASSETS_PATH";
  ipcMain.on(Channel, async(event:IpcMainEvent)=>{
      event.reply(Channel, assets_path);
  });
}
