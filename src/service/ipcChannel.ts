import * as IpcServices from '@/main/channel/ipcService';
type CHANNEL = IpcServices.IpcServiceChannelValOfService;
/** リクエストチャンネル */
export const CHANNEL_REQUEST:CHANNEL = IpcServices.IpcServiceChannels.CHANNEL_REQUEST
/** レスポンスチャンネル */
export const CHANNEL_REPLY:CHANNEL = IpcServices.IpcServiceChannels.CHANNEL_REPLY;

/** メールリクエストチャンネル */
export const CHANNEL_MAIL_REQUEST = IpcServices.IpcMailServiceChannels.CHANNEL_MAIL_REQUEST;
/** メールレスポンスチャンネル */
export const CHANNEL_MAIL_REPLY = IpcServices.IpcMailServiceChannels.CHANNEL_MAIL_REPLY;

