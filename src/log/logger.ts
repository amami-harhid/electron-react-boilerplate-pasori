import logger from 'electron-log';
import { ILogger } from './ILogger';

export class Logger implements ILogger {

    static _debug_mode:boolean = false;

    info(...args: any[]) {
        logger.info(args);
    }
    debug(...args: any[]) {
        if( Logger._debug_mode ){
            logger.debug(args);
        }
    }
    warn(...args: any[]) {
        logger.warn(args);
    }
    error(...args: any[]) {
        logger.error(args);
    }
}