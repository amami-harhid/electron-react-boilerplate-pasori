/**
 * 日付をシフトさせる
 * @param date 基準日
 * @param shift プラスのときは未来日、マイナスのときは過去日を返す
 * @returns 
 */
export const getShiftedDate = (date: Date, shift: number): Date => {
    const _date = new Date(date);
    _date.setDate( date.getDate() + shift);
    return _date;
}
/**
 * 日付をDB形式の文字列にする( yyyy-mm-dd )
 * @param date 
 * @returns 
 */
export const dateToSqlite3Date = (date:Date):string => {

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthStr = String(month).padStart(2,'0');
    const day = date.getDate();
    const dayStr = String(day).padStart(2,'0');
    const dateString = `${year}-${monthStr}-${dayStr}`;
    return dateString;
}
export const dateDateTime = (date:Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthStr = String(month).padStart(2,'0');
    const day = date.getDate();
    const dayStr = String(day).padStart(2,'0');
    const hour = date.getHours();
    const hourStr = String(hour).padStart(2, '0');
    const min = date.getMinutes();
    const minStr = String(min).padStart(2, '0');
    const dateHourMinStr = `${year}/${monthStr}/${dayStr} ${hourStr}:${minStr}`;
    return dateHourMinStr;
}
export const dateToSqlite3DateTimeAMZero = (date: Date):string => {
    return dateToSqlite3Date(date)+"00:00:00";
}