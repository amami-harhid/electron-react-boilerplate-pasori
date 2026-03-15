import * as IpcServices from '@/main/channel/ipcService';
import { HistoriesMemberRow } from '@/db/historiesRow';
import { historiesPageServiceMethods } from '@/service/ipcMain/historiesPageServiceMethods';
const methods = historiesPageServiceMethods;
const ipcRenderer = window.electronService.ipcServiceRenderer;

const CHANNEL_REQUEST = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REQUEST;
const CHANNEL_REPLY = IpcServices.IpcServiceChannels.HISTORIES_CHANNEL_REPLY;

export const historiesPageService = {
	/** 日付を指定して全履歴を取得する */
	getHistoriesByDate: async function(date:Date, notInMember:boolean): Promise<HistoriesMemberRow[]> {
		console.log('getHistoriesByDate date=', date);
		ipcRenderer.send(CHANNEL_REQUEST, methods.getHistoriesByDate.name, date, notInMember);	
		const val = await ipcRenderer.asyncOnce<HistoriesMemberRow[]>(CHANNEL_REPLY);
		console.log('val=',val)
		return val;
	},
	/** 退室を無しにする */
	changeToInRoom: async function(fcno: string): Promise<boolean> {
		ipcRenderer.send(CHANNEL_REQUEST, methods.changeToInRoom.name, fcno);
		const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
		return val;
	},
	/** 入室を無しにする */
	clearInRoom: async function(fcno:string): Promise<boolean> {
		ipcRenderer.send(CHANNEL_REQUEST, methods.clearInRoom.name, fcno);
		const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
		return val;
	},
	/** 退出にする */
	changeToOutRoom: async function(fcno:string): Promise<boolean> {
		ipcRenderer.send(CHANNEL_REQUEST, methods.changeToOutRoom.name, fcno);
		const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
		return val;
	},
	/** 退出から入室へ戻す */
	backToInRoom: async function(fcno:string): Promise<boolean> {
		ipcRenderer.send(CHANNEL_REQUEST, methods.backToInRoom.name, fcno);
		const val = await ipcRenderer.asyncOnce<boolean>(CHANNEL_REPLY);
		return val;
	},
};
