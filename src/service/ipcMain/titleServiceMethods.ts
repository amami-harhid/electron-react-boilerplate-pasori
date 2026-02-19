import { ApConfig } from "@/conf/storeImporter.js";

const DEFAULT_TITLE = '入退室チェッカー';
const KEY_PAGE_TITLE = 'PAGE_TITLE';

/** ページタイトルを取得する */
const getTitle = ():string => {
    const title = 
        (ApConfig.has(KEY_PAGE_TITLE) && ApConfig.get(KEY_PAGE_TITLE)!='')?
        ApConfig.get(KEY_PAGE_TITLE):DEFAULT_TITLE;
    return title;
}
export const titleServiceMethods = {
    getTitle: getTitle,
}

