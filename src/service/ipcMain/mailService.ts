import electron from 'electron';
const ipcMain = electron.ipcMain;

import { Mailer } from '@/mail/sendMail';
import * as IpcServices from '@/main/channel/ipcService';

export function ipcMail() {
    const channel = IpcServices.IpcMailServiceChannels.CHANNEL_MAIL_REQUEST
    const replyChannel = IpcServices.IpcMailServiceChannels.CHANNEL_MAIL_REPLY;
    ipcMain.on(channel, async(event:Electron.IpcMainEvent, mail_to:string, in_out:boolean, name:string)=>{

        const mail_subject = (in_out)? Mailer.subject.IN: Mailer.subject.OUT;
        const text = (in_out)? Mailer.text.IN : Mailer.text.OUT;
        const result = Mailer.sendMail(mail_to, mail_subject, text, name);
        event.reply(replyChannel, result);
    });
}
