
import { exec } from "../dbCommon";

export const Members = {
    createTable: 
        async function(cb:CallableFunction):Promise<number>{
            const query = 
            `CREATE TABLE IF NOT EXISTS members (
                [id] integer primary key autoincrement,
                [fcno] text UNIQUE,
                [name] text,
                [kana] text,
                [mail] text,
                [soft_delete] boolean,
                [date_time] datetime
            )`;
            return exec.run(query, cb);
        },
    dropTable:
        async function dropTable(cb:CallableFunction):Promise<number>{
            const query = `DROP TABLE IF EXISTS members`;
            return exec.run(query, cb);
        },

} as const;