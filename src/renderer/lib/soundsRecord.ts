import { VOLUME } from "./soundConf";

export const soundRecords: Record<string, { url: string; volume: number }> = {
    // url は assetsの中とする
    CARD_IN: {
        url: 'sounds/tm2_quiz000good.wav',
        volume: VOLUME,
    },
    CARD_OUT: {
        url: 'sounds/Jinx-_Bye_Bye_.mp3',
        volume: VOLUME,
    },
    CARD_NG: {
        url: 'sounds/se_nogood09.mp3',
        volume: VOLUME,
    }
} as const;
