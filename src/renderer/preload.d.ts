import {
  ElectronNavigate,
  ElectronPasoriCard,
  ElectronProduct,
  ElectronServiceHandler,
  ElectronMailServiceHandler,
  ElectronTitleServiceHandler
 } from '@/main/preload';

declare global {
  interface Window {
    navigate: ElectronNavigate;
    pasoriCard: ElectronPasoriCard;
    buildEnv: ElectronProduct;
    electronService: ElectronServiceHandler;
    electronMailService: ElectronMailServiceHandler,
    electronTitleService: ElectronTitleServiceHandler,
  }
}

export {};
