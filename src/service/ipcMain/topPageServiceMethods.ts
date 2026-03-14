import type { HistoriesMemberIdmRow } from '@/db/historiesRow';
import type { HistoriesRow } from '@/db/historiesRow';

import * as DateUtils from '@/utils/dateUtils';

import { dbRun, dbGet, transactionBase } from './utils/serviceUtils';

/** IDMが紐づいているメンバーを取得する */
const getMemberByIdm = async (idm: string):Promise<HistoriesMemberIdmRow> => {
	const query =
		`SELECT M.*, I.idm, IFNULL(H.in_room, FALSE) AS in_room
		 FROM members AS M
		 LEFT OUTER JOIN idms AS I ON M.fcno = I.fcno
		 LEFT OUTER JOIN histories AS H ON M.fcno = H.fcno AND H.date = date(?)
		 WHERE I.idm = ?
		 AND M.soft_delete = FALSE`;

	const today = new Date();
	const todayStr = DateUtils.dateToSqlite3Date(today);
	const row = await dbGet<HistoriesMemberIdmRow>(query, [todayStr, idm]);
	return row;
}

/** 入室にする・退室にする */
const setInRoomByFcno = async (fcno:string, idm:string, in_room:boolean):Promise<boolean>=>{
	const mQuery =
		`SELECT M.*, IFNULL(H.date, '') AS date, IFNULL(H.in_room,FALSE) AS in_room,
		 IFNULL(H.date_in, '') AS date_in
		 FROM members AS M
		 LEFT OUTER JOIN histories AS H ON M.fcno = H.fcno AND H.date = date(?)
		 WHERE M.fcno = ? AND M.soft_delete = FALSE`;
	const today = new Date();
	const todayStr = DateUtils.dateToSqlite3Date(today);
	const memberHistory = await dbGet<HistoriesRow>(mQuery, [todayStr, fcno]);
	const rsult = await transactionBase(async ()=>{
		if(memberHistory == undefined) {
			// メンバーがないとき何もしない
		}else{
			// Historiesがないとき
			if(memberHistory.date == '') {
				// 履歴がないとき(入室にする)
				const insertHistories =
					`INSERT INTO histories
					 (fcno, date, date_in, date_out, in_room, date_time)
					 VALUES ( ?, date(?), time('now','localtime'), '', TRUE, datetime('now', 'localtime'))`;
				const changes = await dbRun(insertHistories, [fcno, todayStr]);
				if( changes > 0){
					return true;
				}
				return false;
			}else{
				// 入退室履歴があるとき
				if(memberHistory.date_in == ''){
					// 入室時刻がないとき「入室履歴無し」であるので、入室にする
					const updateHistories =
					`UPDATE histories
					 set in_room = TRUE, date_in = time('now', 'localtime'), date_out= '', date_time = datetime('now', 'localtime')
					 WHERE fcno = ? AND date = date(?)`;
					const changes = await dbRun(updateHistories, [fcno, todayStr]);
					if( changes > 0) {
						return true;
					}
					return false;
				}
				else if(in_room){
					// 退室の取り消し
					const updateHistories =
					`UPDATE histories
					 set in_room = TRUE, date_out= '', date_time = datetime('now', 'localtime')
					 WHERE fcno = ? AND date = date(?)`;
					const changes = await dbRun(updateHistories, [fcno, todayStr]);
					if( changes > 0) {
						return true;
					}
					return false;
				}else{
					// 退室へ
					const updateHistories =
					`UPDATE histories
					 set in_room = FALSE, date_out= time('now', 'localtime'), date_time = datetime('now', 'localtime')
					 WHERE fcno = ? AND date = date(?)`;
					const changes = await dbRun(updateHistories, [fcno, todayStr]);
					if( changes > 0) {
						return true;
					}
				}
			}
		}
		return false;
	});
	return rsult;
}


export const topPageServiceMethods = {
	getMemberByIdm: getMemberByIdm,
	setInRoomByFcno: setInRoomByFcno,
}

