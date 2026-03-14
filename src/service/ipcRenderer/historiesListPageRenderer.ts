import * as IpcServices from '@/main/channel/ipcService';
import { HistoriesMemberRow } from '@/db/historiesRow';
import { historiesPageServiceMethods } from '@/service/ipcMain/historiesPageServiceMethods';
const methods = historiesPageServiceMethods;
const ipcRenderer = window.electronService.ipcServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REPLY;

export const historiesPageService = {
	/** 日付を指定して全履歴を取得する */
	getHistoriesByDate: async function(date:Date): Promise<HistoriesMemberRow[]> {
		ipcRenderer.send(CHANNEL_REQUEST, methods.getHistoriesByDate.name, date);	
		const val = await ipcRenderer.asyncOnce<HistoriesMemberRow[]>(CHANNEL_REPLY);
		return val;
	},
	/** 退室を無しにする */
	changeToInRoom: async function(fcno: string, date: Date): Promise<boolean> {
		ipcRenderer.send(CHANNEL_REQUEST, methods.changeToInRoom.name, fcno, date);
		const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
		return val;
	},
	/** 入室を無しにする */
	changeToClearInRoom: async function(fcno:string, date: Date): Promise<boolean> {
		ipcRenderer.send(CHANNEL_REQUEST, methods.changeToClearInRoom.name, fcno, date);
		const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
		return val;
	}
};
