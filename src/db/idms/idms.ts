
import { exec } from "../dbCommon";

export const Idms = {
    createTable: 
        async function(cb:CallableFunction):Promise<number>{
            const query = 
            `CREATE TABLE IF NOT EXISTS idms (
                [id] integer primary key autoincrement,
                [fcno] text UNIQUE,
                [idm] text,
                [soft_delete] boolean,
                [date_time] datetime
            )`;
            return exec.run(query, cb);
        },
    dropTable:
        async function dropTable(cb:CallableFunction):Promise<number>{
            const query = `DROP TABLE IF EXISTS idms`;
            return exec.run(query, cb);
        },

} as const;