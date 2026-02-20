/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath, envIs } from './util';
import { ipcMainSqliteBridge } from '@/service/ipcMain/ipcMain';
import { CardReaderID } from '@/icCard/cardEventID';
import { ipc_is_production, ipc_assets_path } from './ipc';

import { Logger } from "@/log/logger";
import { LoggerRef } from '@/log/loggerReference';
Logger._debug_mode = envIs.debug; // デバッグモード(true)のときだけ logger.debug() を処理する
const logger = new Logger();
LoggerRef.logger = logger;

import { db } from "@/db/db";
import { DatabaseRef } from '@/db/dbReference';
DatabaseRef.db = db;

let mainWindow: BrowserWindow | null = null;

/** Debug指定のときはTrue( .env 内で指定、参照：src/main/util.ts 内) */
const isDebug = envIs.debug;
/** 本番環境指定のときはTrue( .env 内で指定、参照：src/main/util.ts 内) */
const isProd = envIs.prod;
if ( isProd ) {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDebug) {
  require('electron-debug').default();
}

ipc_is_production(isProd);

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

/** ウィンドウ作成 */
const createWindow = async () => {
    if (isDebug) {
        await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    // Assetフォルダーを通知する処理
    const assetsPath = getAssetPath();
    ipc_assets_path(assetsPath);

    mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      icon: getAssetPath('pasori_icon.png'),
      webPreferences: {
        webSecurity: true, // ローカルリソースロード不可
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));
    mainWindow.setAlwaysOnTop(true, 'screen-saver'); // 常時トップ表示
    mainWindow.moveTop();

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }

    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        db.close();
        app.quit();
    }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();

    });
  })
  .catch(
    (reason: any) => {
        console.log('app error chatch!============')
        logger.error(reason);
    }
  );

// MAIN<-->RENDERERのDB通信
ipcMainSqliteBridge();

// 異常終了を検知する
process.on('uncaughtException', function (error) {
    if(error.message){
      // カードリーダーUSB接続が断続的に切れるときのエラー
      if(error.message.includes('SCardGetStatusChange')) {
        // システム異常を起こさないように努力したが、どうしようもない
        // ときのためにここでキャッチするようにした。
        // キャッチしたとしても自動復旧はしないので、異常発生を知るだけ
        // である。
        logger.error('in Main')
        logger.error("error.stack=",error.stack)
        logger.debug(error);
        const browsers = BrowserWindow.getAllWindows();
        if(browsers && browsers.length > 0){
          const browser = browsers[0];
          browser.webContents.send(CardReaderID.CARD_READER_ERROR);
          return;
        }
      }
    }
    logger.error("error.stack=",error.stack)
    logger.error(error);
});
