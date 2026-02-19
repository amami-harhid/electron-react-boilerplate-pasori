import type { MemberRow } from '@/db/members/memberRow';
import { dbRun, dbAll, transactionBase } from './utils/serviceUtils';
import { LoggerRef } from '@/log/loggerReference';
const logger = LoggerRef.logger;

/** 論理削除されたメンバーを取得する */
const getTrashedMembers = async (): Promise<MemberRow[]> => {
  const query = 
      `SELECT * FROM members 
       WHERE soft_delete = TRUE`;
  const rows: MemberRow[] = await dbAll<MemberRow>(query);
  return rows;
};
/** FCNO指定で論理削除を復活させる */
const setRecorverMemberByFcno = async (fcno:string): Promise<boolean> => {
  const query =
    `UPDATE members 
     SET soft_delete = FALSE, date_time = datetime('now', 'localtime') 
     WHERE fcno = ? AND soft_delete = TRUE`;
  const changes = await dbRun(query, [fcno]);
  if( changes > 0 )
    return true;
  else
    return false;
}

/** 論理削除されたメンバーと紐づく履歴を完全削除する */
const deleteCompletelyByFcno = async (fcno:string): Promise<boolean> => {
    const rsult = await transactionBase(async ()=>{
        const deleteQuery = [
          `DELETE FROM histories WHERE fcno = ?`,
          `DELETE FROM idms WHERE fcno = ?`,
          `DELETE FROM members WHERE fcno = ? AND soft_delete = TRUE`
        ]
        try{
            let count = 0;
            for(const query of deleteQuery){
                const changes = await dbRun(query, [fcno]);
                count += changes;
            }
            if(count>0){
                return true;
            }
            return false;
        }catch(error){
            logger.error(error);
            return false;
        }
    });
    return rsult;
};

export const memberTrashedListServiceMethods = {
  getTrashedMembers: getTrashedMembers,
  setRecorverMemberByFcno: setRecorverMemberByFcno,
  deleteCompletelyByFcno: deleteCompletelyByFcno,
} as const;
