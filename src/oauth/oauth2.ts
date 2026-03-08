import { google } from "googleapis";
import { ApConfig } from '@/conf/confUtil';
import { Logger } from "@/log/logger";
const logger = new Logger();
import { TokensTbl } from "@/db/tokens";
import { TokensRow } from "@/db/tokensRow";
import { initTables } from "@/db/initTables";
const GOOGLE_USER = 'GOOGLE_USER';
const GOOGLE_OAUTH_CLIENT_ID = 'GOOGLE_OAUTH_CLIENT_ID';
const GOOGLE_OAUTH_SECRET = 'GOOGLE_OAUTH_SECRET';
const GOOGLE_OAUTH_ACCESS_TOKEN = 'GOOGLE_OAUTH_ACCESS_TOKEN';
const GOOGLE_OAUTH_REFRESH_TOKEN = 'GOOGLE_OAUTH_REFRESH_TOKEN';
const GOOGLE_GMAIL_SCOPE = 'GOOGLE_GMAIL_SCOPE';
const GOOGLE_OAUTH_REDIRECT = 'GOOGLE_OAUTH_REDIRECT';

class OAuth2 {
    private static googleClientId: string | null = null;
    private static googleSecret: string | null = null;    
    private static oAuth2Client: typeof google.OAuth2Client | null = null;
    private static oAuth2RedirectUri: string | null = null;
    static async toTableTokens() {
        logger.debug('toTableTokens start ==========');
        await initTables();
        //this.toTable(GOOGLE_USER, 0);
        //this.toTable(GOOGLE_OAUTH_CLIENT_ID, 0);
        await OAuth2.toTable(GOOGLE_OAUTH_SECRET, 0);
        //await this.toTable(GOOGLE_OAUTH_REDIRECT, 0);
        await OAuth2.toTable(GOOGLE_OAUTH_ACCESS_TOKEN, 0);
        await OAuth2.toTable(GOOGLE_OAUTH_REFRESH_TOKEN, 0);
    }
    static async toTable(key: string, expired_in: number) {
        logger.debug('toTable key=', key);
        const val = ApConfig.get(key);
        if(val != ''){
            const rslt = await TokensTbl.replaceTable(key, val, expired_in);
            if(rslt) {
                ApConfig.set(key, '');
            }
        }
    }
    static getGoogleUser() {
        return ApConfig.get(GOOGLE_USER);
    }
    static getGoogleClientId() {
        return ApConfig.get(GOOGLE_OAUTH_CLIENT_ID);
    }
    static async getGoogleSecret() {
        const row = await TokensTbl.selectTable(GOOGLE_OAUTH_SECRET);
        return row.token;
    }
    static getRedirectUrl() {
        return ApConfig.get(GOOGLE_OAUTH_REDIRECT);
    }
    static async getAccessToken() {
        const row = await TokensTbl.selectTable(GOOGLE_OAUTH_ACCESS_TOKEN);
        return row.token;
    }
    static async getRefreshToken() {
        const row = await TokensTbl.selectTable(GOOGLE_OAUTH_REFRESH_TOKEN);
        return row.token;
    }
    static async getRefreshTokenExpiry() {
        const row = await TokensTbl.selectTable(GOOGLE_OAUTH_REFRESH_TOKEN);
        return row.expired_in;
    }
    static createOAuth2Client(clientId:string, clientSecret:string, redirect:string): OAuth2Cient {
        logger.debug('In createOAuth2Client clientId=',clientId,', clientSecret=',clientSecret, ', redirect=', redirect);
        const _oAuth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirect
        );

        return _oAuth2Client;
    }
    static async getOAuth2Client() : Promise<OAuth2Cient> {
        logger.debug('getOAuth2Client start ==========');
        await OAuth2.toTableTokens();
        logger.debug('toTableTokens done ==========');
        const clientId = OAuth2.getGoogleClientId();
        const secret = await OAuth2.getGoogleSecret();
        const redirect = await OAuth2.getRedirectUrl();
        if(OAuth2.oAuth2Client == null) {
            OAuth2.oAuth2Client = OAuth2.createOAuth2Client(clientId, secret, redirect);
        }
        else if(OAuth2.googleClientId != clientId || OAuth2.googleSecret != secret || OAuth2.oAuth2RedirectUri != redirect) {
            OAuth2.oAuth2Client = OAuth2.createOAuth2Client(clientId, secret, redirect);
        }
        OAuth2.googleClientId = clientId;
        OAuth2.googleSecret = secret;
        OAuth2.oAuth2Client.setCredentials({
            access_token: await OAuth2.getAccessToken(),
            refresh_token: await OAuth2.getRefreshToken(),
        })
        logger.debug('getOAuth2Client done ==========');
        return OAuth2.oAuth2Client;
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

    client: OAuth2.getOAuth2Client,
    config: {
        getUser : ():string => {
            return ApConfig.get(GOOGLE_USER);
        },
        getClientId : ():string =>{
            return ApConfig.get(GOOGLE_OAUTH_CLIENT_ID)
        },
        getClientSecret : async (): Promise<string> => {
            return await OAuth2.getGoogleSecret();
        },
        getAccessToken: async () : Promise<string> => {
            return await OAuth2.getAccessToken();
        },
        setAccessToken: async (accessToken: string, expired_in: number=-1): Promise<boolean> => {
            const rslt = await TokensTbl.replaceTable(GOOGLE_OAUTH_ACCESS_TOKEN, accessToken, expired_in);
            return rslt;
        },
        getRefreshToken: async (): Promise<string> => {
            return await OAuth2.getRefreshToken();
        },
        getRefreshTokenExpiry: async (): Promise<number> => {
            return await OAuth2.getRefreshTokenExpiry();
        },
        setRefreshToken: async (refreshToken: string, expired_in: number=-1): Promise<boolean> => {
            const rslt = await TokensTbl.replaceTable(GOOGLE_OAUTH_REFRESH_TOKEN, refreshToken, expired_in);
            return rslt;
        },
        getScopes: () => {
            return ApConfig.get(GOOGLE_GMAIL_SCOPE).split(',');
        },
        getRedirect: ()=> {
            return ApConfig.get(GOOGLE_OAUTH_REDIRECT);
        }
    }
}

