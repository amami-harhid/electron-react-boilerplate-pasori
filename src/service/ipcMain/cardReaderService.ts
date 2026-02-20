import electron from 'electron';
const ipcMain = electron.ipcMain;
import { SCardReader } from '@/icCard/icCardReader';
import {CardReaderID } from '@/icCard/cardEventID';

export function ipcCardReader(){
    const channel = CardReaderID.CARD_READER_START;
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, force:boolean)=>{
      console.log('ipcCardReader on force=',force);
      const reader = SCardReader.getCardReader(force);
      reader.ready();
    });
}
