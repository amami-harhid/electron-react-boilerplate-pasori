import { google } from "googleapis";
import { ApConfig } from '@/conf/confUtil';

const GOOGLE_USER = 'GOOGLE_USER';
const GOOGLE_OAUTH_CLIENT_ID = 'GOOGLE_OAUTH_CLIENT_ID';
const GOOGLE_OAUTH_SECRET = 'GOOGLE_OAUTH_SECRET';
const GOOGLE_OAUTH_ACCESS_TOKEN = 'GOOGLE_OAUTH_ACCESS_TOKEN';
const GOOGLE_OAUTH_REFRESH_TOKEN = 'GOOGLE_OAUTH_REFRESH_TOKEN';
const GOOGLE_GMAIL_SCOPE = 'GOOGLE_GMAIL_SCOPE';
const GOOGLE_OAUTH_REDIRECT = 'http://localhost/oauth2callback';
class OAuth2 {
    private static instance: OAuth2 | null = null;
    private googleClientId: string | null = null;
    private googleSecret: string | null = null;    
    private oAuth2Client: typeof google.OAuth2Client | null = null;
    getGoogleUser() {
        return ApConfig.get(GOOGLE_USER);
    }
    getGoogleClientId() {
        return ApConfig.get(GOOGLE_OAUTH_CLIENT_ID)
    }
    getGoogleSecret() {
        return ApConfig.get(GOOGLE_OAUTH_SECRET);
    }
    static getInstance(): OAuth2 {
        if(OAuth2.instance == null) {
            OAuth2.instance = new OAuth2();
        }
        return OAuth2.instance;
    }

    constructor() {
    }
    createOAuth2Client(clientId:string, secret:string): OAuth2Cient {
        const _oAuth2Client = new google.auth.OAuth2(
            clientId,
            secret,
            GOOGLE_OAUTH_REDIRECT
        )
        return _oAuth2Client;
    }
    getOAuth2Client() : OAuth2Cient {
        const clientId = this.getGoogleClientId();
        const secret = this.getGoogleSecret();
        if(this.oAuth2Client == null) {
            this.oAuth2Client = this.createOAuth2Client(clientId, secret);
        }
        else if(this.googleClientId != clientId || this.googleSecret != secret) {
            this.oAuth2Client = this.createOAuth2Client(clientId, secret);
        }
        this.googleClientId = clientId;
        this.googleSecret = secret;
        return this.oAuth2Client;
    }
}

export type Tokens = {
    access_token: string, 
    refresh_token?:string, 
    scope: string, 
    id_token: string, 
    refresh_token_expires_in?: number,
    expiry_date: number
}
export type OAuth2Cient = typeof google.OAuth2Client;
export type OAuth2Error = {code: number};
export const oAuth2 = {

    client: OAuth2.getInstance().getOAuth2Client(),
    config: {
        getClientId : ():string =>{
            return ApConfig.get(GOOGLE_OAUTH_CLIENT_ID)
        },
        setClientId : (clientId: string) => {
            ApConfig.set(GOOGLE_OAUTH_CLIENT_ID, clientId);
        },
        getSecret : (): string => {
            return ApConfig.get(GOOGLE_OAUTH_SECRET);
        },
        setSecret : (secret: string) => {
            ApConfig.set(GOOGLE_OAUTH_SECRET, secret);
        },
        getAccessToken: () : string => {
            return ApConfig.get(GOOGLE_OAUTH_ACCESS_TOKEN);
        },
        setAccessToken: (accessToken: string) => {
            ApConfig.set(GOOGLE_OAUTH_ACCESS_TOKEN, accessToken);
        },
        getRefreshToken: (): string => {
            return ApConfig.get(GOOGLE_OAUTH_REFRESH_TOKEN);
        },
        setRefreshToken: (refreshToken: string) => {
            ApConfig.set(GOOGLE_OAUTH_REFRESH_TOKEN, refreshToken);
        },
        getScopes: () => {
            return ApConfig.get(GOOGLE_GMAIL_SCOPE).split(',');
        },
        getRedirect: ()=> {
            return ApConfig.get(GOOGLE_OAUTH_REDIRECT);
        }
    }
}

