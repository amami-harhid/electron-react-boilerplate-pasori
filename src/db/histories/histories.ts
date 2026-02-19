import { exec } from "../dbCommon";

export const Histories = {
    createTable: 
        async function(cb:CallableFunction):Promise<number>{
            const query = `
                CREATE TABLE IF NOT EXISTS histories (
                    [id] integer primary key autoincrement,
                    [fcno] text,
                    [date] date,
                    [in_room] false,
                    [date_time] datetime
                )`;
            return exec.run(query, cb);
        },
    dropTable:
        async function(cb:CallableFunction):Promise<number>{
            const query = `DROP TABLE IF EXISTS histories`;
            return exec.run(query,cb);
        }, 
} as const;