import { ipcMain } from 'electron';
import * as IpcServices from '@/main/channel/ipcService';
import { ipcMainAuthorization, pageTransition } from './authService';
import { ipcMainTopPage } from '../ipcMain/topPageService';
import { ipcMainMemberListPage } from "./memberListService";
import { ipcMainMemberCardListPage } from './memberCardListService';
import { ipcMainMemberTrashedListPage } from './memberTrashedListService';
import { ipcMainHistoriesListPagePage } from './historiesPageService';
import { ipcMainTitle } from './titleService';
import { ipcCardReader } from './cardReaderService';
import { ipcMail } from './mailService';

const channel = IpcServices.IpcChannels.CHANNEL_REQUEST_QUERY;
const replyChannel = IpcServices.IpcServiceChannels.CHANNEL_REPLY;

// RENDERER --> MAIN -->RENDERERのDB通信
export function ipcMainSqliteBridge() {
    ipcMainAuthorization();
    pageTransition();
    ipcMainTopPage();
    ipcMainMemberListPage();
    ipcMainMemberCardListPage();
    ipcMainHistoriesListPagePage();
    ipcMainMemberTrashedListPage();
    ipcMainTitle();
    ipcCardReader();
    ipcMail();
};


