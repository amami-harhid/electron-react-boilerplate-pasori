import { exec } from "./dbCommon";
import type { TokensRow } from "./tokensRow";
import { Logger } from "@/log/logger";
const logger = new Logger();

export const TokensTbl = {
    createTable: 
        async function(cb:CallableFunction = ()=>{}):Promise<number>{
            logger.debug('tokens createTable------');
            const query = `
                CREATE TABLE IF NOT EXISTS tokens (
                    [id] integer primary key autoincrement,
                    [key] text UNIQUE,
                    [token] text,
                    [expired_in] number
                )`;
            logger.debug(`tokens createTable query=${query}`);
            return exec.run(query, cb);
        },
    dropTable:
        async function(cb:CallableFunction = ()=>{}):Promise<number>{
            const query = `DROP TABLE IF EXISTS tokens`;
            return exec.run(query,cb);
        }, 
    
    selectTable: 
        async function(key: string): Promise<TokensRow> {
            logger.debug(`tokens selectTable------ key=`, key);
            const query = `SELECT * FROM tokens WHERE key = ?`;
            const row = await exec.get<TokensRow>(query, [key]);
            return row;
        },
    replaceTable:
        async function(key: string, token: string, expired_in:number = -1): Promise<boolean> {
            logger.debug(`tokens replaceTable------`);
            const row = await this.selectTable(key);
            if(row) {
                if( expired_in == -1) {
                    const query = 
                    `UPDATE tokens SET
                    token = ?
                    WHERE key = ?
                    `;
                    logger.debug(`tokens replaceTable query=`,query);
                    const rslt = await exec.run(query,()=>{},[token, key]);
                    if( rslt > 0 )
                        return true;
                    else
                        return false;
                }
                else{
                    if( token == '') {
                        const query = 
                        `UPDATE tokens SET
                            expired_in = ?
                        WHERE key = ?
                        `;
                        logger.debug(`tokens replaceTable query=`,query);
                        const rslt = await exec.run(query,()=>{},[expired_in, key]);
                        if( rslt > 0 )
                            return true;
                        else
                            return false;

                    }else{
                        const query = 
                            `UPDATE tokens SET
                            token = ?, expired_in = ?
                            WHERE key = ?
                            `;
                        logger.debug(`tokens replaceTable query=`,query);
                        const rslt = await exec.run(query,()=>{},[token, expired_in, key]);
                        if( rslt > 0 )
                            return true;
                        else
                            return false;
                    }
                }
            }else{
                const query = 
                `INSERT INTO tokens 
                (key, token, expired_in) VALUES ( ?, ?, ? )
                `;
                logger.debug(`tokens replaceTable query=`,query);
                const rslt = await exec.run(query,()=>{},[key, token, expired_in]);
                if( rslt > 0 )
                    return true;
                else
                    return false;
            }
        }
} as const;