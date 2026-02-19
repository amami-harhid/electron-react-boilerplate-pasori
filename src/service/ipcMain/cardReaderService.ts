import electron from 'electron';
const ipcMain = electron.ipcMain;
import { Logger } from '@/log/logger';
import { SCardReader } from '@/icCard/icCardReader';
import {CardReaderID } from '@/icCard/cardEventID';

export function ipcCardReader(){
    const channel = CardReaderID.CARD_READER_START;
    const replyChannel = CardReaderID.CARD_READER_READY;
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, force:boolean)=>{
      console.log('ipcCardReader on force=',force);
      const reader = SCardReader.getCardReader(force);
      reader.ready();
    });
}
