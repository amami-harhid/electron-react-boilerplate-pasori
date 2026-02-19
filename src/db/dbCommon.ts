// Main/Render どちらも import できるはず。
import sqlite from 'sqlite3';
import { Logger } from '../log/logger';
import { DatabaseRef } from './dbReference';

const logger = new Logger();
const run = (query:string, cb:CallableFunction, params:any[]=[]):Promise<number> => {
    const db = DatabaseRef.db;
    return new Promise<number>((resolve, reject)=>{
        const _query = `${query}`;
        const stmt = db.prepare(_query);
        stmt.run(params, function(err:Error){
            if (err) {
                cb(err);
                logger.error(err);
                stmt.finalize();
                reject(err);
            }
            const runResult = this as sqlite.RunResult;
            const changes = runResult.changes;
            stmt.finalize();
            resolve(changes);
        });
    })
};
// 対象の行をすべて返す
const all = <T>(query:string, params:any[]=[]):Promise<T[]> => {
    const db = DatabaseRef.db;
    return new Promise<T[]>((resolve, reject)=>{
        const stmt = db.prepare(query);
        stmt.all(params,(err:Error, rows:T[])=>{
            if (err) {
                logger.error(err);
                stmt.finalize();
                throw(err);
            }
            stmt.finalize();
            resolve(rows);            
        })
    });
}
// 1行だけ返す
const get = <T>(query:string, params:any[]=[]):Promise<T> => {
    const db = DatabaseRef.db;
    return new Promise<T>((resolve, reject)=>{
        const stmt = db.prepare(query);
        stmt.get(params,(err:Error, row:T)=>{
            if (err) {
                stmt.finalize();
                reject(err);
            }
            stmt.finalize();
            resolve(row);
        });
    });
}
export type Exec = (...args:any[]) => Promise<any>;
export type Method = {
    name: string,
    exec: Exec,
}
export const exec = {
    all: all,
    get: get,
    run: run,
}

export const Transaction = {
    BEGIN: 'BEGIN TRANSACTION',
    COMMIT: 'COMMIT',
    ROLLBACK: 'ROLLBACK',
}