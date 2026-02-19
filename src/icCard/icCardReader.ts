import { ipcMain } from 'electron';
import { BrowserWindow } from 'electron';
import { NFC, Reader } from "./nfc-pcsc/index";
import { Logger } from "@/log/logger";
import { CardReaderID, type TCardReaderChannel } from './cardEventID';

interface ICCard {
    uid: string; // とりあえず uid を使えるようにする
}



const logger = new Logger()
type TReader = typeof Reader;


const getMainBrowser = (): BrowserWindow => {
    const browsers = BrowserWindow.getAllWindows();
    if (browsers && browsers.length > 0) {
        const browser = browsers[0];
        return browser;
    }
    throw new Error('Not found browserWindow');
}
export class SCardReader {
    static instance : CardReader;
    static getCardReader(force:boolean = false) {
        if(force){
            console.log('===== [1] create instance CardReader')
            SCardReader.instance = new CardReader();
        }
        if(SCardReader.instance == null){
            console.log('===== [2] create instance CardReader')
            SCardReader.instance = new CardReader();
        }
        return SCardReader.instance;
    }
}
export class CardReader {
    private _ready: boolean = false;
    private _logger: Logger;
    private nfc: typeof NFC;
    private pre_uid:string = '';
    constructor() {
        console.log('CardReader instructor =============')
        //const nfc = new NFC();
        /* @ts-ignore */
        this.nfc = new NFC(logger);
        /* @ts-ignore */
        this.nfc.close();
        this._ready = false;
        this._logger = {
            info: logger.info,
            warn: logger.warn,
            debug: (...args: any) => {
                //console.log(...args);
                logger.debug(...args);
            },
            error: (...args: any) => {
                //console.log(...args);
                logger.error(...args);
            },
        };

        // Reader.ready状態を返す
        const Channel = CardReaderID.ListenCardIsReady;
        this.listenIsReady(Channel, (event: Electron.IpcMainEvent) => {
            event.reply(Channel, this._ready);
        });
    }
    listenIsReady(channel: TCardReaderChannel, callBack: Electron.IpcMainEventListener) {
        ipcMain.on(channel, callBack);
    }
    isReady(): boolean {
        return this._ready;
    }
    ready() {
        try {
            this.ready_main();
        } catch (e) {
            //console.log('ready error chatch!=========')
            const browser = getMainBrowser();
            browser.webContents.send(CardReaderID.CARD_READER_ERROR);
            logger.error(e);
        }
    }
    close() {
        /* @ts-ignore */
        this.nfc.close();
    }
    ready_main() {
        const cardTouch = async (card: ICCard) => {
            const uid = card.uid;
            if(this.pre_uid == uid){
                // 連続してタッチイベントが起こるので、同一UIDの場合は
                // タッチイベント連続を回避する。
                // カードリリースされた後であればタッチイベントを処理可能。
                return;
            }
            this.pre_uid = uid;
            if (uid && uid.length > 0) {
                this._logger.debug('CardReader ==> send message uid=', uid);
                const browser = getMainBrowser();
                browser.webContents.send(CardReaderID.CARD_TOUCH, uid);
                const msg = `CARD TOUCH uid=(${uid})`;
                this._logger.debug(msg);
            } else {
                const msg = `CANT SEND uid=(${uid})`;
                this._logger.error(msg);
            }
        }
        const cardRelease = async (card: ICCard) => {
            this.pre_uid = '';
            const uid = card.uid;
            const browser = getMainBrowser();
            browser.webContents.send(CardReaderID.CARD_RELEASE, uid);
            const msg = `CARD TOUCH uid=(${uid})`;
            this._logger.debug(msg);
        }
        //console.log('before nfc.on ready');
        /* @ts-ignore */
        this.nfc.on('reader', (reader: TReader) => {
            const browser = getMainBrowser();
            browser.webContents.send(CardReaderID.CARD_READER_READY);
            this._ready = true;
            /* @ts-ignore */
            const device_name = reader.reader.name;
            this._logger.debug(`Device ready device=(${device_name})`);
            /* @ts-ignore */
            reader.on('card', cardTouch);
            /* @ts-ignore */
            reader.on('card.off', cardRelease);
            /* @ts-ignore */
            reader.on('end', () => {
                browser.webContents.send(CardReaderID.CARD_READER_END);
                const msg = `device removed device=(${device_name})`
                this._logger.debug(msg);
            });
            /* @ts-ignore */
            reader.on('error', (err) => {
                //console.log('In icCardReader');
                console.log(err);
                const browser = getMainBrowser();
                browser.webContents.send(CardReaderID.CARD_READER_ERROR);
            })
        });
        const _this = this;
        /* @ts-ignore */
        this.nfc.on('error', (error: Error) => {
            const browser = getMainBrowser();
            browser.webContents.send(CardReaderID.CARD_READER_ERROR);
            _this.close();
            // NFCエラー(例：CardReader接続タイムアウト)を検出する
            // nfc(pcsclite)のエラー発生元が出すコードがSJISの様子。
            // というかWindowsが出しているメッセージの様子。
            // それがWindows->pcsclite->nfc->の途中で文字化けしている。
            _this._logger.error('icCardReader nfc.on error');
            _this._logger.error(error);
        })
    }
}
