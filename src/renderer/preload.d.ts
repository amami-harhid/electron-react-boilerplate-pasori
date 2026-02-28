import {
  ElectronNavigate,
  ElectronPasoriCard,
  ElectronProduct,
  ElectronServiceHandler,
  ElectronMailServiceHandler,
  ElectronOAuth2ServiceHandler,
  ElectronTitleServiceHandler
 } from '@/main/preload';

declare global {
  interface Window {
    navigate: ElectronNavigate;
    pasoriCard: ElectronPasoriCard;
    buildEnv: ElectronProduct;
    electronService: ElectronServiceHandler;
    electronMailService: ElectronMailServiceHandler,
    electronOAuth2Service: ElectronOAuth2ServiceHandler,
    electronTitleService: ElectronTitleServiceHandler,
  }
}

export {};
