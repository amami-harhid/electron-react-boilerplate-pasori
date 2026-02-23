import { session, BrowserWindow } from 'electron';
import { ApConfig } from '@/conf/confUtil';
import { OAuthInfo, GOOGLE_OAUTH_ACCESS_TOKEN , GOOGLE_OAUTH_REFRESH_TOKEN } from './oauthInfo';
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;
import Url from 'url';
import queryString from 'querystring';
import { NodemailerError } from './nodemailerError';

export type TAuth = {
    type: string,
    user: string,
    clientId: string,
    clientSecret: string,
    refreshToken: string,
    accessToken?: string|null,
};
 
type TToken = {access_token:string, refreshToken: string}
type TTokenAndAuthenticated = {token:TToken, authenticated:boolean}

export class Auth {
    private oAuth2Client: typeof google.OAuth2Client;
    private browser: BrowserWindow;
    private scopes: string[];
    private authorizationDomains : {allow: string[], deny:string[]}
    private authenticated?: boolean;
    private childBrowser : BrowserWindow|null = null;
    constructor() {
        this.oAuth2Client = new OAuth2(
            OAuthInfo.clientId,
            OAuthInfo.clientSecret,
            "http://localhost"
        );
        this.oAuth2Client.on('tokens', (tokens:TToken)=>{
            if(tokens.refreshToken){
                ApConfig.set(GOOGLE_OAUTH_REFRESH_TOKEN, tokens.refreshToken);
            }
            if(tokens.access_token){
                ApConfig.set(GOOGLE_OAUTH_ACCESS_TOKEN, tokens.access_token);
            }
            console.log("oAuth2Client.on tokens=", tokens);
        })
        const browsers = BrowserWindow.getAllWindows()
        this.browser = browsers[0];
        const ScopeGmailSendKey = 'GOOGLE_GMAIL_SCOPE_KEY';
        const scope = ApConfig.get(ScopeGmailSendKey);
        this.scopes = [scope];
        this.authorizationDomains = {allow:[], deny:[]};
    }
    allowAuthorizationDomain(domains:string[] = []) {
        this.authorizationDomains.allow = domains
    }
    denyAuthorizationDomain(domains:string[] = []) {
        this.authorizationDomains.deny = domains
    }
    authenticate (callback:()=>Promise<void>) {
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
            return this.fetchGoogleService(callback);
        })
        .catch((error:NodemailerError)=>{
            if(this.authenticated == false && error.code && error.code == '530') {

            }
        })
    }
    fetchGoogleService(callback:()=>Promise<void>) {
        return new Promise( async(resolve,reject)=>{
            try{
                await callback();
            }catch(error){
                const mError = error as NodemailerError;
                if(this.authenticated == false && mError.code == '410') {
                    return this.retryAuthenticate();
                }
                return reject(error);
            }
        });
    }
    /** アクセストークンの期限切れの場合に呼び出される */
    retryAuthenticate() {
        Promise.resolve()
        .then(()=>{
            return this.tryFetchTokenFromGoogle()
        })
        .then((tokenAndAuthenticated)=>{
            return this.setAuthenticatedAndCredentials(tokenAndAuthenticated)
        })
    }
    loadTokenFromApplicationStorage():Promise<TTokenAndAuthenticated> {
        return new Promise<TTokenAndAuthenticated>((resolve, reject) => {
            if(ApConfig.has(GOOGLE_OAUTH_ACCESS_TOKEN) && ApConfig.has(GOOGLE_OAUTH_REFRESH_TOKEN)){
                if(ApConfig.get(GOOGLE_OAUTH_ACCESS_TOKEN)!='' && ApConfig.get(GOOGLE_OAUTH_REFRESH_TOKEN)!=''){
                    const access_token = ApConfig.get(GOOGLE_OAUTH_ACCESS_TOKEN);
                    const refreshToken = ApConfig.get(GOOGLE_OAUTH_REFRESH_TOKEN);
                    return resolve({token:{access_token:access_token, refreshToken:refreshToken}, authenticated:false});
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
                //access_token: tokenAndAuthenticated.token.access_token, // 強制的に期限切れにする
                refresh_token: tokenAndAuthenticated.token.refreshToken,
                //expiry_date: 1, // 強制的に期限切れにする
            });
            resolve()
        });
    }
    /** GoogleのOAuth2を実行してtoken情報を取得する */
    tryFetchTokenFromGoogle():Promise<TTokenAndAuthenticated> {
        return new Promise<TTokenAndAuthenticated>((resolve, reject) => {
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
                console.log('ACCESS_TOKEN = ', tokens.access_token);
                ApConfig.set(GOOGLE_OAUTH_ACCESS_TOKEN, tokens.access_token);
                if(tokens.refreshToken){
                    console.log('REFRESH_TOKEN = ', tokens.refreshToken);
                    ApConfig.set(GOOGLE_OAUTH_REFRESH_TOKEN, tokens.refreshToken);
                    resolve({ token: tokens, authenticated: true });
                }else{
                    const refreshToken = ApConfig.get(GOOGLE_OAUTH_REFRESH_TOKEN)
                    resolve({ token: {refreshToken:refreshToken, access_token: tokens.access_token}, authenticated: true });
                }
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
        const oAuthBrowser = this.createChildBrowser();
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
                    this.clearChildBrowser();
                    resolve(code);
                }
                if(count>20){
                    reject();
                }
            })
            oAuthBrowser.loadURL(url)
        });
    }
    clearChildBrowser() {
        if(this.childBrowser){
            this.childBrowser.close();
            this.childBrowser = null;
        }
    }
    createChildBrowser() : BrowserWindow {
        if(this.childBrowser != null){
            return this.childBrowser;
        }
        this.childBrowser = new BrowserWindow({
            parent: this.browser,
            title: '認証画面',
            modal: true,
        });
        this.childBrowser.webContents.openDevTools();
        this.childBrowser.loadFile('subBrowser.html');
        this.childBrowser.on("closed", () => (this.childBrowser = null));
        return this.childBrowser;
    }

    getAccessToken(): Promise<string> {
        return new Promise<string>(async (resolve)=>{
            const accessToken = await this.oAuth2Client.getAccessToken();
            resolve(accessToken);
        })
    }
}