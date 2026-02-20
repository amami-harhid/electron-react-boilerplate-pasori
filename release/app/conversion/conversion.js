import path from 'path';

import sqlite from 'sqlite3';
const sqlite3 = sqlite.verbose();
const sqlPath = "./pasori_card.db";
const db = new sqlite3.Database(sqlPath, (err) =>{
    if(err){
        logger.error(err);
    }
});

const all = async(db, query, params=[]) => {
    const stmt = db.prepare(query);
    return new Promise((resolve,reject)=>{
        stmt.all(params, function(err,rows){
            if (err) {
                console.log(err);
                stmt.finalize();
                reject(err);
                return;
            }
            stmt.finalize();
            console.log(rows);
            resolve(rows);
        });
    });
};
const run = async(db, query, params=[]) => {
    const stmt = db.prepare(query);
    return new Promise((resolve,reject)=>{
        stmt.run(params, function(err){
            if (err) {
                console.log(err);
                stmt.finalize();
                reject(err);
                return;
            }
            const changes = this.changes;
            stmt.finalize();
            resolve(changes);
        });
    });
};


const cardsAll = 'SELECT * FROM cards ORDER BY id';
const cardsRows = await all(db, cardsAll);
//console.log(cards);
const cards = [];
for(const card of cardsRows){
    const _card = {
        fcno: card.fcno,
        name: card.name,
        kana: card.kana,
        mail: card.mail,
        date_time: card.date_time,
    }
    cards.push(_card);
}
console.log(cards);
const idms = [];
for(const card of cardsRows){
    if(card.idm){
        const idm = {
            fcno: card.fcno,
            idm: card.idm,
            date_time: card.date_time,
        }
        idms.push(idm);
    }
}
console.log(idms);

const historiesAll = 'SELECT * FROM histories ORDER BY id';
const historiesRows = await all(db, historiesAll);
const histories = []
for(const history of historiesRows){
    const _history = {
        fcno: history.fcno,
        date: history.date_in,
        in_room: (history.date_out=='')? true:false,
        date_time: history.date_time,
    }
    histories.push(_history);
}
console.log(histories)
db.close();

const newSqlPath = "./pasori.db";
const newDb = new sqlite3.Database(newSqlPath, (err) =>{
    if(err){
        logger.error(err);
    }
});

await run(newDb, 'DROP TABLE IF EXISTS members');
await run(newDb, 
            `CREATE TABLE IF NOT EXISTS members (
                [id] integer primary key autoincrement,
                [fcno] text UNIQUE,
                [name] text,
                [kana] text,
                [mail] text,
                [soft_delete] boolean,
                [date_time] datetime
            )`);
for(const card of cards) {
    const query = 
        `INSERT INTO members 
         (fcno, name, kana, mail, soft_delete, date_time)
         VALUES
         (?,    ?,    ?,    ?,    FALSE,   ?)
        `;
    const p = [card.fcno, card.name, card.kana, card.mail, card.date_time];
    const rslt = await run(newDb, query, p);
    if(rslt > 0) {
        continue;
    }
    else throw new Error('MEMBERS INSERT ERROR');
}

await run(newDb, 'DROP TABLE IF EXISTS idms');
await run(newDb, 
            `CREATE TABLE IF NOT EXISTS idms (
                [id] integer primary key autoincrement,
                [fcno] text UNIQUE,
                [idm] text,
                [soft_delete] boolean,
                [date_time] datetime
            )`);

for(const idm of idms) {
    const query = 
        `INSERT INTO idms 
         (fcno, idm, soft_delete, date_time)
         VALUES
         (?,    ?,    FALSE,   ?)
        `;
    const p = [idm.fcno, idm.idm, idm.date_time];
    const rslt = await run(newDb, query, p);
    if(rslt > 0) {
        continue;
    }
    else throw new Error('IDMS INSERT ERROR');
}

await run(newDb, 'DROP TABLE IF EXISTS histories');
await run(newDb, 
            `CREATE TABLE IF NOT EXISTS histories (
                    [id] integer primary key autoincrement,
                    [fcno] text,
                    [date] date,
                    [in_room] false,
                    [date_time] datetime
            )`);

for(const history of histories){
    const query = `
        INSERT INTO histories
        (fcno, date, in_room, date_time)
        VALUES
        (?,  ?,  ?, ?)
    `;
    const p = [history.fcno, history.date, history.in_room, history.date_time];
    const rslt = await run(newDb, query, p);
    if(rslt > 0) {
        continue;
    }
    else throw new Error('HISTORIES INSERT ERROR');
}

newDb.close();
