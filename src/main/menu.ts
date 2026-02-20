import {
  Menu,
  BrowserWindow,
} from 'electron';
import { CardReaderID } from '@/icCard/cardEventID';

import { appVersion } from '../version';
import { routePagePath } from '@/renderer/routePath';
import { envIs } from './util';

const GENERAL = '#Genaral';
const MEMBERS = '#MEMBERS';
const MEMBERCARDS = '#MEMBERCARDS';
const DEV_TOOL = "#DEV_TOOL";
const HISTORIES = "#HISTORIES";

const app_version = appVersion();

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    const template = this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: 'File',
        submenu: [
          {
            label: 'HOME',
            click() {
                sendMessage("navigate", routePagePath.Home);
            }
          },
          {
            label: 'ゴミ箱',
            click() {
                sendMessage("navigate", routePagePath.MemberTrashedListPage);
            }
          }
        ]
      },
      {
        label: '操作',
        submenu: [
          {
            label: '読取開始',
            id: GENERAL,
            enabled: true,
            click() {
                sendMessage("navigate", routePagePath.Top);
            },
          },
          {
            label: 'メンバー一覧',
            id: MEMBERS,
            enabled: true,
            click() {
              sendMessage("navigate", routePagePath.MemberListPage)
            },
          },
          {
            label: 'メンバー（カード）一覧',
            id: MEMBERCARDS,
            enabled: true,
            click() {
              sendMessage("navigate", routePagePath.MemberCardListPage)
            },
          },
        ],
      },
      {
        label: '履歴',
        submenu: [
          {
            label: '入退室履歴',
            id: HISTORIES,
            enabled: true,
            click: () => {
                sendMessage("navigate", routePagePath.HistoriesListPage);
            }
          },
        ]
      },
      {
        label: 'HELP',
        submenu: [
          {
                label: '開発者ツール',
                id: DEV_TOOL,
                enabled: true,
                click: () => {
                    openDevTool();
                }
          },
          {
              label: 'Reload',
              enabled: true,
              click: () => {
                  this.mainWindow.webContents.reload();
              },
          },
          {
              label: 'VERSION',
              submenu: [
                {
                  label: `${app_version}`,
                }
              ],
          },
        ]
      },
    ];
    if( envIs.debug ){
      templateDefault.push(
      {
        label: 'DEBUG',
        submenu: [
          {
              label: '登録なしカード',
              enabled: true,
              click: () => {
                  const browserWindows = BrowserWindow.getFocusedWindow();
                  browserWindows?.webContents.send(CardReaderID.CARD_TOUCH, '00000000000000000000');
              }
          },
          {
              label: 'カードタッチ',
              enabled: true,
              click: () => {
                  const browserWindows = BrowserWindow.getFocusedWindow();
                  browserWindows?.webContents.send(CardReaderID.CARD_TOUCH, '123456123456123456');
              }
          },
          {
              label: 'カード離す',
              enabled: true,
              click: () => {
                  const browserWindows = BrowserWindow.getFocusedWindow();
                  browserWindows?.webContents.send(CardReaderID.CARD_RELEASE, '');
              }
          },

        ]
      });
    }
    return templateDefault;
  }
}

const sendMessage = (messageId: string, ...args:string[]): void => {
    const browserWindow = BrowserWindow.getFocusedWindow();
    if( browserWindow ) {
      browserWindow.webContents.send(messageId, ...args);
    }
}
const openDevTool = () => {
    const browser = BrowserWindow.getFocusedWindow();
    if(browser){
        browser.webContents.openDevTools(); // 開発者ツールを表示
    }
}