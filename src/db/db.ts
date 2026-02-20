import {app} from 'electron';
import { ApConfig } from '@/conf/storeImporter.js';
import path from 'path';
import { Logger } from "@/log/logger";
import sqlite from 'sqlite3';
const sqlite3 = sqlite.verbose();
import webpackPaths from '@webpack.paths';

import { envIs } from '@/main/util'

const logger = new Logger();

const KEY_USER_DATA = "userData";
const DEFAULT_DB_NAME = "pasori.sqlite3";
const KEY_DB_NAME = "DB_NAME";
const KEY_DB_PATH = "DB_PATH";

/** Database名称を取得 */
const getDbName = ():string => {
    const db_name = (ApConfig.has(KEY_DB_NAME) && ApConfig.get(KEY_DB_NAME) != "")? 
        ApConfig.get(KEY_DB_NAME) : DEFAULT_DB_NAME
    return db_name;
}
/** Databaseのパスを取得 */
const sqlPath = ():string => {
    const dbName = getDbName();
    if( envIs.development){
        const sqlPath = path.join(webpackPaths.appPath,'sql', dbName);
        return sqlPath;
    }else{
        const db_path = (ApConfig.has(KEY_DB_PATH) && ApConfig.get(KEY_DB_PATH)!="")? 
            ApConfig.get(KEY_DB_PATH): app.getPath(KEY_USER_DATA);
        const sqlPath = path.join(db_path, dbName);
        return sqlPath;
    }
}

export const db = new sqlite3.Database(sqlPath(), (err:Error|null):void =>{
    if(err){
        logger.error(err);
    }
});

