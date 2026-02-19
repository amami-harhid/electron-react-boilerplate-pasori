export const CardReaderID = {
    CARD_START : "card-touch-start",
    CARD_STOP : "card-touch-stop",
    CARD_TOUCH : 'card-touch',
    CARD_RELEASE: 'card-release',
    CARD_READY: 'card-ready',
    CARD_READER_START: 'card-reader-start',
    CARD_READER_READY: 'card-reader-ready',
    CARD_READER_END: 'card-reader-end',
    CARD_READER_ERROR: 'card-reader-error',
    ListenCardIsReady: 'ListenCardIsReady',
} as const;

export type TCardReaderChannel = (typeof CardReaderID)[keyof typeof CardReaderID];
