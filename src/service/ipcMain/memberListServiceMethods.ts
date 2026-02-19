import type { MemberRow } from '@/db/members/memberRow';
import type { MemberIdmRow } from '@/db/members/memberIdmRow';

import { dbRun, dbAll, dbGet, transactionBase } from './utils/serviceUtils';

/** FCNO指定でメンバーを取得する */
const getMemberByFcno = async(fcno:string):Promise<MemberRow>=>{
    const query = 
        `SELECT * FROM members 
         WHERE fcno = ? AND soft_delete = FALSE`;
    const row = await dbGet<MemberRow>(query, [fcno]);
    return row;
}

/** FCNOでIDM情報を含めたメンバー情報を取得する */
const getMemberIdmByFcno = async (fcno: string):Promise<MemberIdmRow> => {
    const query = 
        `SELECT M.*, IFNULL(I.idm, '') AS idm
         FROM members AS M
         LEFT OUTER JOIN idms AS I ON M.fcno = I.fcno
         WHERE M.fcno = ? AND M.soft_delete = FALSE`;
    
    const row = await dbGet<MemberIdmRow>(query, [fcno]);
    return row;
}

/** 全メンバーを取得する */
const getMembers = async():Promise<MemberIdmRow[]>=>{
    const selectAll =
        `SELECT M.*, IFNULL(I.idm,'') AS idm FROM members AS M
         LEFT OUTER JOIN idms AS I ON M.fcno = I.fcno
         WHERE M.soft_delete = FALSE
         ORDER BY M.kana ASC`;
    const rows = dbAll<MemberIdmRow>(selectAll,[]);
    return rows;
}

/** メンバーを追加する */
const addMember = async(row: MemberRow):Promise<boolean>=>{
    const rsult = await transactionBase(async ():Promise<boolean>=>{
        const insert = `INSERT INTO members
                (fcno, name, kana, mail, soft_delete, date_time)
                VALUES (?, ?, ?, ?, FALSE, datetime('now', 'localtime'))`;
        const changes = await dbRun(insert, [row.fcno, row.name, row.kana, row.mail]);
        if(changes>0)
            return true;
        else
            return false;
    });
    return rsult;
}

/** FCNO指定でメンバー情報を更新する */
const updateMemberByFcno = async(fcno: string, row: MemberRow):Promise<boolean>=>{
    const rsult = await transactionBase(async ():Promise<boolean>=>{
        const update = `UPDATE members
                SET name = ?, kana = ?, mail = ?, date_time = datetime('now', 'localtime')
                WHERE fcno = ? AND soft_delete = FALSE`;
        const changes = await dbRun(update, [row.name, row.kana, row.mail, fcno]);
        if(changes>0)
            return true;
        else
            return false;
    });
    return rsult;
}

/** FCNO指定でメンバーを論理削除する */
const deleteMemberByFcno = async(fcno: string):Promise<boolean>=>{
    const rsult = await transactionBase(async ():Promise<boolean>=>{
        const update =
                `UPDATE members SET soft_delete = TRUE, date_time = datetime('now', 'localtime')
                 WHERE fcno = ? AND soft_delete = FALSE`;
        const changes = await dbRun(update, [fcno]);
        console.log('delete cards changes=',changes);
        if(changes>0)
            return true;
        else
            return false;
    });
    return rsult;
}

export const memberListPageServiceMethods = {
    getMemberByFcno: getMemberByFcno,
    getMemberIdmByFcno: getMemberIdmByFcno,
    getMembers: getMembers,
    addMember: addMember,
    updateMemberByFcno: updateMemberByFcno,
    deleteMemberByFcno: deleteMemberByFcno,
}
