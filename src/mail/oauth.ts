import { session, BrowserWindow } from 'electron';
import { ApConfig } from '@/conf/confUtil';
import { OAuthInfo } from './oauthInfo';
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;
import Url from 'url';
import queryString from 'querystring';

const ACCESS_TOKEN_KEY = 'GOOGLE_OAUTH_ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'GOOGLE_OAUTH_REFRESH_TOKEN'
export type TAuth = {
    type: string,
    user: string,
    clientId: string,
    clientSecret: string,
    refreshToken: string,
};
 
type TToken = {access_token:string, refresh_token: string}
type TTokenAndAuthenticated = {token:TToken, authenticated:boolean}

export class Auth {
    private oAuth2Client: typeof google.OAuth2Client;
    private browser: BrowserWindow;
    private scopes: string[];
    private authorizationDomains : {allow: string[], deny:string[]}
    private authenticated?: boolean;
    constructor() {
        this.oAuth2Client = new OAuth2(
            OAuthInfo.clientId,
            OAuthInfo.clientSecret,
            "http://localhost"
        );
        const browsers = BrowserWindow.getAllWindows()
        this.browser = browsers[0];
        this.scopes = [
            'https://mail.google.com/'
        ];
        this.authorizationDomains = {allow:[], deny:[]};
    }
    allowAuthorizationDomain(domains:string[] = []) {
        this.authorizationDomains.allow = domains
    }
    denyAuthorizationDomain(domains:string[] = []) {
        this.authorizationDomains.deny = domains
    }
    authenticate (callback:CallableFunction) {
        Promise.resolve()
        .then(():Promise<TTokenAndAuthenticated>=>{
            console.log('start loadTokenFromApplicationStorage');
            //アプリケーションにトークン情報があるか確認する
            return this.loadTokenFromApplicationStorage()
        })
        .then((tokenAndAuthenticated:TTokenAndAuthenticated)=>{
            console.log('start setAuthenticatedAndCredentials');
            //アプリケーションにトークン情報を保存する
            return this.setAuthenticatedAndCredentials(tokenAndAuthenticated)
        })
        .catch(()=>{
            console.log('start tryFetchTokenFromGoogle');
            //アプリケーションにトークン情報がない場合はgoogleからトークン情報を取得する
            return this.tryFetchTokenFromGoogle()
        })
        .then(()=>{
            console.log('Authentication success');
            const _auth = {
                type: "OAuth2",
                user: OAuthInfo.user,
                clientId: OAuthInfo.clientId,
                clientSecret: OAuthInfo.clientSecret,
                refreshToken: ApConfig.get(REFRESH_TOKEN_KEY),            
            }
            if(callback){
                callback(_auth);
            }
        })
    }
    loadTokenFromApplicationStorage():Promise<TTokenAndAuthenticated> {
        return new Promise<TTokenAndAuthenticated>((resolve, reject) => {
            if(ApConfig.has(ACCESS_TOKEN_KEY) && ApConfig.has(REFRESH_TOKEN_KEY)){
                if(ApConfig.get(ACCESS_TOKEN_KEY)!='' && ApConfig.get(REFRESH_TOKEN_KEY)!=''){
                    const access_token = ApConfig.get(ACCESS_TOKEN_KEY);
                    const refresh_token = ApConfig.get(REFRESH_TOKEN_KEY);
                    return resolve({token:{access_token:access_token, refresh_token:refresh_token}, authenticated:false});
                }
                reject();
            }else{
                reject();
            }
        });
    }
    setAuthenticatedAndCredentials(tokenAndAuthenticated:TTokenAndAuthenticated):Promise<void>{
        return new Promise<void>((resolve) => {
            this.authenticated = tokenAndAuthenticated.authenticated
            this.oAuth2Client.setCredentials({
                access_token: tokenAndAuthenticated.token.access_token,
                refresh_token: tokenAndAuthenticated.token.refresh_token
            });
            resolve()
        });
    }
    /** GoogleのOAuth2を実行してtoken情報を取得する */
    tryFetchTokenFromGoogle():Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Promise.resolve()
            .then(() => {
                console.log('start requestOAuthCode');
                return this.requestOAuthCode()
            })
            .then((code)=>{
                console.log('start fetchTokenFromGoogle code=',code);
                return this.fetchTokenFromGoogle(code)
            })
            .then((tokens: TToken)=>{
                console.log('tokens=', tokens);
                console.log('SET TOKENS')
                console.log('ACCESS_TOKEN = ', tokens.access_token)
                console.log('ID_TOKEN = ', tokens.refresh_token);
                ApConfig.set(ACCESS_TOKEN_KEY, tokens.access_token);
                ApConfig.set(REFRESH_TOKEN_KEY, tokens.refresh_token);
                resolve();
            })
            .catch((err)=>{
                console.log('error occured err=',err);
                reject(err);
            })
        });
    }
    fetchTokenFromGoogle(code: string):Promise<TToken> {
        console.log('fetchTokenFromGoogle code=', code);
        return new Promise((resolve, reject) => {
            this.oAuth2Client.getToken(code, (err:any, tokens:TToken )=>{
                if (err) return reject(err);
                console.log("fetchTokenFromGoogle")
                console.log(tokens)
                resolve(tokens);
            })
        });
    }
    requestOAuthCode(): Promise<string> {
        let count = 0;
        return new Promise<string>((resolve, reject) => {
            const url = this.oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: this.scopes})
             // chrominumからHTTPアクセスをしてGoogle認証確認画面を表示させる
            console.log(url);
            const redirectUrl = 'http://localhost'
            const filter = {
                urls: ['http://localhost*']
            }
            // Google API 認証情報で設定したリダイレクト先が表示されたときのイベント
            session.defaultSession.webRequest.onBeforeRedirect((details)=>{
                count += 1;
                const url = details.redirectURL;
                console.log(`redirect url(${count}) = `, url);
                if(url.startsWith('http://localhost')){
                    const _query = Url.parse(url).query as string
                    let query = queryString.parse(_query)
                    console.log('query=', query);
                    const code = query.code as string;
                    resolve(code);
                }
                if(count>20){
                    reject();
                }
            })
           this.browser.loadURL(url)
        });
    }
}