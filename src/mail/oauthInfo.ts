import { ApConfig } from '@/conf/confUtil';

export const GOOGLE_USER_KEY = 'GOOGLE_USER';
export const GOOGLE_OAUTH_CLIENT_ID_KEY = 'GOOGLE_OAUTH_CLIENT_ID';
export const GOOGLE_OAUTH_SECRET_KEY = 'GOOGLE_OAUTH_SECRET';
export const GOOGLE_OAUTH_ACCESS_TOKEN = 'GOOGLE_OAUTH_ACCESS_TOKEN';
export const GOOGLE_OAUTH_REFRESH_TOKEN = 'GOOGLE_OAUTH_REFRESH_TOKEN';
export const GOOGLE_GMAIL_SCOPE_KEY = 'GOOGLE_GMAIL_SCOPE';

const getUser = () => {
    const user = ApConfig.get(GOOGLE_USER_KEY);
    return user;
}
const getClientId = () => {
    const clientId = ApConfig.get(GOOGLE_OAUTH_CLIENT_ID_KEY);
    return clientId;
}
const getClientSecret = () => {
    const clientSecret = ApConfig.get(GOOGLE_OAUTH_SECRET_KEY);
    return clientSecret;
}

const getRefreshToken = () => {
    const refreshToken = ApConfig.get(GOOGLE_OAUTH_REFRESH_TOKEN);
    return refreshToken;
}

const getAccessToken = () => {
    const accessToken = ApConfig.get(GOOGLE_OAUTH_ACCESS_TOKEN);
    return accessToken;
}
const getScope = () => {
    const scope = ApConfig.get(GOOGLE_GMAIL_SCOPE_KEY);
    return scope;
}

/** 認証情報 */
export const OAuthInfo = {
    user: getUser,
    clientId: getClientId,
    clientSecret:  getClientSecret,
    refreshToken: getRefreshToken,
    accessToken: getAccessToken,
    scope : getScope,
}