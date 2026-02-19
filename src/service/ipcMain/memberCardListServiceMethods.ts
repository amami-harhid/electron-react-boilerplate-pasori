import type { MemberIdmRow } from '@/db/members/memberIdmRow';
import type { IdmRow } from '@/db/idms/idmRow';

import { dbRun, dbAll, dbGet, transactionBase } from './utils/serviceUtils';

const getIdm = async(idm:string): Promise<MemberIdmRow> =>{
    const query =
        `SELECT * FROM idms
         WHERE idm = ?`; // 論理削除は考慮しない
    const row = await dbGet<MemberIdmRow>(query, [idm]);
    return row;
}

/** FCNO指定でIDMを更新する */
const setIdmByFcno = async(fcno:string, idm:string):Promise<boolean>=>{

    const query =
        `SELECT * FROM idms
         WHERE fcno = ?`; // 論理削除されているかは考慮しない
    const row = await dbGet<IdmRow>(query,[fcno]);
    console.log('In setIdmByFcno, query=',query);
    console.log('In setIdmByFcno, row=',row);
    if(row) {
        if(row.fcno == fcno){
            // idmが登録されているメンバーと一致(論理削除を含む)
            const query =
              `UPDATE idms SET idm = ?, soft_delete = FALSE, date_time = datetime('now', 'localtime')
               WHERE fcno = ?`;
            console.log('In setIdmByFcno[1], query=',query);
            const changes = await dbRun(query, [idm, fcno]);
            console.log('In setIdmByFcno[1], changes=',changes);
            if(changes>0){
                return true;
            }
            return false;
        }else{
            // IDMは使用済
            return false;
        }
    }else{
        const query =
            `INSERT INTO idms (fcno, idm, soft_delete, date_time)
             VALUES( ?, ?, FALSE, datetime('now', 'localtime') )`;
        try{
        console.log('In setIdmByFcno[2], query=',query);
        const changes = await dbRun(query, [fcno, idm]);
        console.log('In setIdmByFcno[2], changes=',changes);
        if(changes>0){
            return true;
        }

        }catch(e){
            console.log('=========e=',e);
            const _e = e as Error
            // @ts-ignore
            console.log('_e.code = ', _e.code);
            // @ts-ignore
            if(_e.code == 'SQLITE_CONSTRAINT') {
                console.log('SQLITE_CONSTRAINT catched')
                return true;
            }
        }
        return false;
    }
}

/** 全メンバーを取得する */
const getMembers = async(deletedIncluding:boolean=false):Promise<MemberIdmRow[]>=>{
    if(deletedIncluding){
        const selectAll =
            `SELECT M.*, IFNULL(I.idm,'') AS idm FROM members AS M
             LEFT OUTER JOIN idms AS I ON M.fcno = I.fcno
             ORDER BY M.kana ASC`;
        const rows = dbAll<MemberIdmRow>(selectAll,[]);
        return rows;
    }else{
        const selectAll =
            `SELECT M.*, IFNULL(I.idm,'') AS idm FROM members AS M
             LEFT OUTER JOIN idms AS I ON M.fcno = I.fcno
             WHERE M.soft_delete = FALSE
             ORDER BY M.kana ASC`;
        const rows = dbAll<MemberIdmRow>(selectAll,[]);
        return rows;
    }
}


export const memberCardListPageServiceMethods = {
    getIdm: getIdm,
    setIdmByFcno: setIdmByFcno,
    getMembers: getMembers,
}
