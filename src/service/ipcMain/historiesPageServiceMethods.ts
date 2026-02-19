import type { HistoriesMemberRow } from '@/db/histories/historiesRow';
import * as DateUtils from '../../utils/dateUtils';
import { dbAll } from './utils/serviceUtils';

/** 日付を指定して全履歴を取得する */
const getHistoriesByDate = async (date: Date):Promise<HistoriesMemberRow[]> => {
    const query =
        `SELECT M.*, IFNULL(H.in_room,FALSE) AS in_room, IFNULL(H.date, '') AS date 
         FROM members AS M
         LEFT OUTER JOIN histories AS H ON H.fcno = M.fcno AND H.date = date(?)
         WHERE M.soft_delete = FALSE
         ORDER BY M.kana ASC`;
    const date_str = DateUtils.dateToSqlite3Date(date);
    const rows = await dbAll<HistoriesMemberRow>(query, [date_str]);
    return rows;
}

export const historiesPageServiceMethods = {
    getHistoriesByDate: getHistoriesByDate,
}