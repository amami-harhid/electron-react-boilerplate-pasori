export const getShiftedDate = (date: Date, shift: number): Date => {
    const _date = new Date(date);
    _date.setDate( date.getDate() + shift);
    return _date;
}
export const dateToSqlite3Date = (date:Date):string => {

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthStr = String(month).padStart(2,'0');
    const day = date.getDate();
    const dayStr = String(day).padStart(2,'0');
    const dateString = `${year}-${monthStr}-${dayStr}`;
    return dateString;
}

export const dateToSqlite3DateTimeAMZero = (date: Date):string => {
    return dateToSqlite3Date(date)+"00:00:00";
}