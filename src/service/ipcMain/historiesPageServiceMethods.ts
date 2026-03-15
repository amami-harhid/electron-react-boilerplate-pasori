import type { HistoriesMemberRow } from '@/db/historiesRow';
import * as DateUtils from '../../utils/dateUtils';
import { dbAll, dbGet, dbRun } from './utils/serviceUtils';

/** 日付を指定して全履歴を取得する */
const getHistoriesByDate = async (date: Date, notInMember:boolean):Promise<HistoriesMemberRow[]> => {
	if(notInMember) {
		// histories.date = 今日の日付
		// histories.date_in = 空 を抽出する
		const query =
		`SELECT * FROM (
		 SELECT M.*, IFNULL(H.in_room,FALSE) AS in_room, IFNULL(H.date, '') AS date,
		 IFNULL(H.date_in,'') AS date_in, IFNULL(H.date_out, '') AS date_out
		 FROM members AS M
		 LEFT OUTER JOIN histories AS H 
		 ON H.fcno = M.fcno AND H.date = ?
		 WHERE M.soft_delete = FALSE
		 ) AS HM
		 WHERE HM.date_in = ''
		 ORDER BY HM.kana ASC`;
		const date_str = DateUtils.dateToSqlite3Date(date);
		const rows = await dbAll<HistoriesMemberRow>(query, [date_str]);
		return rows;

	}else{
		const query =
		`SELECT M.*, IFNULL(H.in_room,FALSE) AS in_room, IFNULL(H.date, '') AS date,
		 IFNULL(H.date_in,'') AS date_in, IFNULL(H.date_out, '') AS date_out
		 FROM members AS M
		 LEFT OUTER JOIN histories AS H 
		 ON H.fcno = M.fcno AND H.date = date(?) AND H.date_in <> ''
		 WHERE M.soft_delete = FALSE
		 ORDER BY M.kana ASC`;
		const date_str = DateUtils.dateToSqlite3Date(date);
		const rows = await dbAll<HistoriesMemberRow>(query, [date_str]);
		return rows;
	}
}
const backToInRoom = async (fcno: string): Promise<boolean> => {

	const query = 
			`UPDATE histories 
			 SET in_room = TRUE, date_out = ''
			 WHERE fcno = ? AND date = date('now','localtime')
			`;
	const rslt = await dbRun(query, [fcno]);
	if(rslt > 0)
		return true;
	else
		return false;

}
const changeToInRoom = async (fcno: string): Promise<boolean> => {
	const select = 
		`SELECT * FROM histories
		 WHERE fcno = ? AND date = date('now','localtime')
		`;
	//const date_str = DateUtils.dateToSqlite3Date(date);
	const row = await dbGet(select, [fcno]);
	if(row) {
		const query = 
			`UPDATE histories 
			 SET in_room = TRUE, date_in = time('now','localtime'), date_out = ''
			 WHERE fcno = ? AND date = date('now','localtime')
			`;
		const rslt = await dbRun(query, [fcno]);
		if(rslt > 0)
			return true;
		else
			return false;
	}else{
		const query = 
			`INSERT INTO histories 
			 (fcno, date, date_in, date_out, in_room, date_time)
			 VALUES
			 (?, date('now','localtime'), time('now','localtime'), '', TRUE, datetime('now','localtime'))
			`;
		const rslt = await dbRun(query, [fcno]);
		if(rslt > 0)
			return true;
		else
			return false;
	}
}
const changeToOutRoom = async (fcno: string): Promise<boolean> => {
	const query = 
		`UPDATE histories 
		 SET in_room = FALSE, date_out = time('now','localtime')
		 WHERE fcno = ? AND date = date('now','localtime')
		`;
	const rslt = await dbRun(query, [fcno]);
	if(rslt > 0)
		return true;
	else
		return false;

}
const clearInRoom = async (fcno: string): Promise<boolean> => {
	const query = 
		`UPDATE histories 
		 SET in_room = FALSE, date_in = '', date_out = ''
		 WHERE fcno = ? AND date = date('now','localtime')
		`;
	const rslt = await dbRun(query, [fcno]);
	if(rslt > 0)
		return true;
	else
		return false;
}
export const historiesPageServiceMethods = {
	getHistoriesByDate: getHistoriesByDate,
	backToInRoom: backToInRoom,
	changeToOutRoom: changeToOutRoom,
	changeToInRoom: changeToInRoom,
	clearInRoom: clearInRoom,
}