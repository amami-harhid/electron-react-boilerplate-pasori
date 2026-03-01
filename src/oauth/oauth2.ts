import { google } from "googleapis";
import { ApConfig } from '@/conf/confUtil';

const GOOGLE_USER = 'GOOGLE_USER';
const GOOGLE_OAUTH_CLIENT_ID = 'GOOGLE_OAUTH_CLIENT_ID';
const GOOGLE_OAUTH_SECRET = 'GOOGLE_OAUTH_SECRET';
const GOOGLE_OAUTH_ACCESS_TOKEN = 'GOOGLE_OAUTH_ACCESS_TOKEN';
const GOOGLE_OAUTH_REFRESH_TOKEN = 'GOOGLE_OAUTH_REFRESH_TOKEN';
const GOOGLE_GMAIL_SCOPE = 'GOOGLE_GMAIL_SCOPE';
const GOOGLE_OAUTH_REDIRECT = 'GOOGLE_OAUTH_REDIRECT';
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
    getRedirectUrl() {
        return ApConfig.get(GOOGLE_OAUTH_REDIRECT);
    }
    getAccessToken() {
        return ApConfig.get(GOOGLE_OAUTH_ACCESS_TOKEN);
    }
    getRefreshToken() {
        return ApConfig.get(GOOGLE_OAUTH_REFRESH_TOKEN);
    }
    static getInstance(): OAuth2 {
        if(OAuth2.instance == null) {
            OAuth2.instance = new OAuth2();
        }
        return OAuth2.instance;
    }

    constructor() {
    }
    createOAuth2Client(clientId:string, clientSecret:string, redirect:string): OAuth2Cient {
        console.log('In createOAuth2Client clientId=',clientId,', clientSecret=',clientSecret, ', redirect=', redirect);
        const _oAuth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirect
        );

        return _oAuth2Client;
    }
    getOAuth2Client() : OAuth2Cient {
        const clientId = this.getGoogleClientId();
        const secret = this.getGoogleSecret();
        const redirect = this.getRedirectUrl();
        if(this.oAuth2Client == null) {
            this.oAuth2Client = this.createOAuth2Client(clientId, secret,redirect);
        }
        else if(this.googleClientId != clientId || this.googleSecret != secret) {
            this.oAuth2Client = this.createOAuth2Client(clientId, secret, redirect);
        }
        this.googleClientId = clientId;
        this.googleSecret = secret;
        this.oAuth2Client.setCredentials({
            access_token: this.getAccessToken(),
            refresh_token: this.getRefreshToken(),
        })

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
        getUser : ():string => {
            return ApConfig.get(GOOGLE_USER);
        },
        getClientId : ():string =>{
            return ApConfig.get(GOOGLE_OAUTH_CLIENT_ID)
        },
        getClientSecret : (): string => {
            return ApConfig.get(GOOGLE_OAUTH_SECRET);
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

