export const IpcChannels = {
    CHANNEL_REQUEST_QUERY: 'request-query-asynchronous',
    CHANNEL_REPLY_QUERY: 'reply-query-asynchronous',
    CHANNEL_IPC_EXAMPLE: 'ipc-example',
} as const;

export const IpcServiceChannels = {
    CHANNEL_REQUEST: 'request-service',
    CHANNEL_REPLY: 'reply-service',
    TOPPAGE_CHANNEL_REQUEST: 'toppage-request-service',
    TOPPAGE_CHANNEL_REPLY: 'toppage-reply-service',
    MEMBERLIST_CHANNEL_REQUEST: 'memberlistpage-request-service',
    MEMBERLIST_CHANNEL_REPLY: 'memberlistpage-reply-service',
    MEMBERCARDLIST_CHANNEL_REQUEST: 'membercardlistpage-request-service',
    MEMBERCARDLIST_CHANNEL_REPLY: 'membercardlistpage-reply-service',
    HISTORIES_CHANNEL_REQUEST: 'historiespage-request-service',
    HISTORIES_CHANNEL_REPLY: 'historiespage-reply-service',
    MEMBERTRUSHED_CHANNEL_REQUEST: 'memberTrushedpage-request-service',
    MEMBERTRUSHED_CHANNEL_REPLY: 'memberTrushedpage-reply-service',
} as const;

export const IpcMailServiceChannels = {
    CHANNEL_MAIL_REQUEST: 'request-mail-service',
    CHANNEL_MAIL_REPLY: 'reply-mail-service',
} as const;

export const IpcTitleServiceChannels = {
    CHANNEL_TITLE_REQUEST: 'request-title-service',
    CHANNEL_TITLE_REPLY: 'reply-title-service',
} as const;

export type IpcChannelValOfService = (typeof IpcChannels)[keyof typeof IpcChannels];

export type IpcServiceChannelValOfService = (typeof IpcServiceChannels)[keyof typeof IpcServiceChannels];

export type IpcMailServiceChannelsValOfService = (typeof IpcMailServiceChannels)[keyof typeof IpcMailServiceChannels];

export type IpcTitleServiceChannelsValOfServie = (typeof IpcTitleServiceChannels)[keyof typeof IpcTitleServiceChannels];