import { Members } from './members';
import { Idms } from './idms';
import { Histories } from './histories';
import { TokensTbl } from './tokens';
import { Logger } from '@/log/logger';
const logger = new Logger();
export const initTables = async() => {
    logger.debug('---- initTables start ')
    await Members.createTable();
    await Idms.createTable();
    await Histories.createTable();
    await TokensTbl.createTable();
    await Histories.autoLeaveRoom();
    logger.debug('---- initTables done ')
}
