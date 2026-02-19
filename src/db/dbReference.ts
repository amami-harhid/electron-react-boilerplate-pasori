import sqlite from 'sqlite3';

export const database:{[key : string]: sqlite.Database | undefined} = {
    db: undefined,
}

export class DatabaseRef {
    static db: sqlite.Database;
}