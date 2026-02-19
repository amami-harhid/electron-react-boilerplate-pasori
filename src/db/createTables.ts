import * as DotEnv from 'dotenv';
DotEnv.config();
import { envIs } from '@/main/util';
import Sqlite from 'sqlite3';
import { DatabaseRef } from './dbReference';
import { Members } from './members/members';
import { Idms } from './idms/idms';
import { Histories } from '../db/histories/histories';
import { MemberRow } from './members/memberRow';
import { dbRun } from '@/service/ipcMain/utils/serviceUtils';
//---- DB TABLE INSERT DUMMY DATA
const memberDatas:MemberRow[] = [
    {
      fcno: '0001',
      name: 'ひながた みなみ',
      kana: 'ヒナガタ ミナミ',
      mail: 'minami-xxx@test.com',
    },
    {
      fcno: '0002',
      name: 'ジェームス 鴇田',
      kana: 'トキタ ジェームス',
      mail: 'jms-xxxx@test.com',
    },
    {
      fcno: '0003',
      name: 'ジェームス 鴇田2',
      kana: 'トキタ ジェームス2',
      mail: 'jms-xxxx2@test.com',
    }

] as const;


export const createTables = async(db: Sqlite.Database) => {
    DatabaseRef.db = db;
    if( envIs.development ){
        console.log('DEBUG DATA SHIKOMI!')
        await Members.dropTable(()=>{});
        await Idms.dropTable(()=>{});
        await Histories.dropTable(()=>{});
    }
    await Members.createTable(()=>{});
    await Idms.createTable(()=>{});
    await Histories.createTable(()=>{});

    if( envIs.development ){
        console.log('DEBUG DATA SHIKOMI!')
        for(const data of memberDatas) {
            await memberInsert(data);
        }
    }

}

const memberInsert = async (data:MemberRow) => {
    const query = 
            `INSERT INTO members 
             (fcno, name, kana, mail, soft_delete, date_time) 
             VALUES(?,?,?,?, FALSE, datetime('now', 'localtime'))`;
    await dbRun(query, 
            [data.fcno,
             data.name,
             data.kana,
             data.mail
            ]);
}