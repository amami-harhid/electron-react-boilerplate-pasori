import {
  ElectronHandler,
  ElectronNavigate,
  ElectronPasoriCard,
  ElectronProduct,
  ElectronServiceHandler,
  ElectronMailServiceHandler,
  ElectronTitleServiceHandler
 } from '@/main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    navigate: ElectronNavigate;
    pasoriCard: ElectronPasoriCard;
    buildEnv: ElectronProduct;
    electronService: ElectronServiceHandler;
    electronMailService: ElectronMailServiceHandler,
    electronTitleService: ElectronTitleServiceHandler,
  }
}

export {};
