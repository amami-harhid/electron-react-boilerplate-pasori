import { exec } from "./dbCommon";

export const Histories = {
    createTable: 
        async function(cb:CallableFunction= ()=>{}):Promise<number>{
            const query = `
                CREATE TABLE IF NOT EXISTS histories (
                    [id] integer primary key autoincrement,
                    [fcno] text,
                    [date] text,
                    [date_in] text,
                    [date_out] text,
                    [in_room] boolean,
                    [date_time] text
                )`;
            return exec.run(query, cb);
        },
    dropTable:
        async function(cb:CallableFunction= ()=>{}):Promise<number>{
            const query = `DROP TABLE IF EXISTS histories`;
            return exec.run(query,cb);
        },

    // 昨日以前の入室状態を退室状態にする
    autoLeaveRoom:
        async function(cb:CallableFunction=()=>{}):Promise<number>{
            const query = 
            `UPDATE histories SET in_room = FALSE, date_out = ?
             WHERE in_room = TRUE AND date < date('now', 'localtime')
            `;
            return exec.run(query, cb, ['23:59:59']);
        }
} as const;