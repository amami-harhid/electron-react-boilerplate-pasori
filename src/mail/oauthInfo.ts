import { ApConfig } from '@/conf/confUtil';

const GOOGLE_USER_KEY = 'GOOGLE_USER_KEY';
const GOOGLE_OAUTH_CLIENT_ID_KEY = 'GOOGLE_OAUTH_CLIENT_ID';
const GOOGLE_OAUTH_SECRET_KEY = 'GOOGLE_OAUTH_SECRET';

const getUser = () => {
    const user = (ApConfig.has(GOOGLE_USER_KEY) )? ApConfig.get(GOOGLE_USER_KEY): '';
    return user;
}
const getClientId = () => {
    const clientId = (ApConfig.has(GOOGLE_OAUTH_CLIENT_ID_KEY) )? ApConfig.get(GOOGLE_OAUTH_CLIENT_ID_KEY): '';
    return clientId;
}
const getClientSecret = () => {
    const clientSecret = (ApConfig.has(GOOGLE_OAUTH_SECRET_KEY) )? ApConfig.get(GOOGLE_OAUTH_SECRET_KEY): '';
    return clientSecret;
}

/** 認証情報 */
export const OAuthInfo = {
    user: getUser(),
    clientId: getClientId(),
    clientSecret:  getClientSecret(),
}