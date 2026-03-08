import { Members } from './members';
import { Idms } from './idms';
import { Histories } from './histories';
import { TokensTbl } from './tokens';

export const initTables = async() => {
    await Members.createTable();
    await Idms.createTable();
    await Histories.createTable();
    console.log('---- TokensTbl.createTable()')
    await TokensTbl.createTable();
    console.log('---- TokensTbl.createTable() done')

}
