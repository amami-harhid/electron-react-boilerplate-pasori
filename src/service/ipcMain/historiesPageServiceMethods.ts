import type { HistoriesMemberRow } from '@/db/historiesRow';
import * as DateUtils from '../../utils/dateUtils';
import { dbAll, dbRun } from './utils/serviceUtils';

/** 日付を指定して全履歴を取得する */
const getHistoriesByDate = async (date: Date):Promise<HistoriesMemberRow[]> => {
	const query =
		`SELECT M.*, IFNULL(H.in_room,FALSE) AS in_room, IFNULL(H.date, '') AS date,
		 IFNULL(H.date_in,'') AS date_in, IFNULL(H.date_out, '') AS date_out
		 FROM members AS M
		 LEFT OUTER JOIN histories AS H ON H.fcno = M.fcno AND H.date = date(?) AND H.date_in <> ''
		 WHERE M.soft_delete = FALSE
		 ORDER BY M.kana ASC`;
	const date_str = DateUtils.dateToSqlite3Date(date);
	const rows = await dbAll<HistoriesMemberRow>(query, [date_str]);
	return rows;
}
const changeToInRoom = async (fcno: string, date: Date): Promise<boolean> => {
	const date_str = DateUtils.dateToSqlite3Date(date);
	const query = 
		`UPDATE histories 
		 SET in_room = TRUE, date_out = ''
		 WHERE fcno = ? AND date = date(?)
		`;
	const rslt = await dbRun(query, [fcno, date_str]);
	if(rslt > 0)
		return true;
	else
		return false;
}
const changeToClearInRoom = async (fcno: string, date: Date): Promise<boolean> => {
	const date_str = DateUtils.dateToSqlite3Date(date);
	const query = 
		`UPDATE histories 
		 SET in_room = FALSE, date_in = '', date_out = ''
		 WHERE fcno = ? AND date = date(?)
		`;
	const rslt = await dbRun(query, [fcno, date_str]);
	if(rslt > 0)
		return true;
	else
		return false;
}
export const historiesPageServiceMethods = {
	getHistoriesByDate: getHistoriesByDate,
	changeToInRoom: changeToInRoom,
	changeToClearInRoom: changeToClearInRoom,
}