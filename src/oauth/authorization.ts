import { google } from 'googleapis';
import { session, BrowserWindow } from 'electron';
import { AuthError } from './authError';
import { oAuth2, type Tokens, type OAuth2Error } from './oauth2';
import { Logger } from "@/log/logger";
const logger = new Logger();

const onTokens = (tokens:Tokens) => {
    logger.debug('Token再発行')
    logger.debug(tokens);
    if(tokens.access_token){
        oAuth2.config.setAccessToken(tokens.access_token);
    }
    if(tokens.refresh_token){
        oAuth2.config.setRefreshToken(tokens.refresh_token);
    }
}
type Token = {access_token: string, refresh_token?: string}

/**
 * Google認証
 * RefreshToken の有効期限切れのとき、無効化されているとき、
 * ローカルにTokenが保存されていないときに
 * Google認証画面を表示して再認証を行う。
 * 
 * 項(1)はアプリを起動した最初の１回、実行することを前提にしている
 */
export const authorization = () => {
    const oAuth2Client = oAuth2.client;
    oAuth2Client.on('tokens', onTokens);
    Promise.resolve()
    .then(()=>{
        logger.debug('-----tryApi-----')
        const refreshToken = oAuth2.config.getRefreshToken();
        const accessToken = oAuth2.config.getAccessToken();
        return tryApi(oAuth2Client, refreshToken, accessToken);
    })
    .catch((err)=>{
        logger.debug('-----tryApi.catch-----')
        if(err.code == 401 || err.code == 400){
            // tryApi で認証エラー、有効期限切れエラーが起きたときの対処
            return requestOAuthCode(oAuth2Client);
        }else{
            throw err;
        }
    })
    .then((token:Token)=>{
        return new Promise<void>((resolve, reject)=>{
            logger.debug('token=', token);
            if(token.access_token && token.refresh_token){
                if(token.access_token){
                    oAuth2.config.setAccessToken(token.access_token);
                }
                if(token.refresh_token){
                    oAuth2.config.setRefreshToken(token.refresh_token);
                }
            }else{
                reject(new Error('token に access_token, refresh_token のどちらもない'));
            }
            resolve();
        })        
    })
    .catch((err)=>{
        logger.debug('err[999]=', err);
        throw err;
    })
    
}
const tryApi = (oAuth2Client: any ,refreshToken:string, accessToken:string):Promise<Token> => {
    return new Promise( async(resolve, reject)=>{
        logger.debug('refreshToken=',refreshToken,',accessToken=',accessToken)
        if( refreshToken == '' || accessToken == ''){
            const error = new AuthError("local token not found");
            error.code = 401;
            return reject(error);
        }
        try{
            logger.debug('oAuth2Client=', oAuth2Client);
            const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
            const info = await oauth2.userinfo.get(); // ユーザー情報を取得してみる
            logger.debug('userinfo info=', info)
            const token:Token = {
                access_token: accessToken,
                refresh_token: refreshToken,
            }
            logger.debug('========== get user info success ==========');
            resolve(token); // 成功したら認証OK
        }catch(err){
            logger.debug('userinfo.get.catch=', err)
            const _error = err as OAuth2Error;
            _error.code = 999;
            if(_error.code == 401) {
                logger.debug('========== get user info error ==========');
                // 401 : 有効期限切れ
                const error = new AuthError("Expired");
                error.code = 401;
                return reject(error);
            }else if(_error.code == 400){
                // 400 : 認証エラー
                const error = new AuthError("No granted");
                error.code = 400;
                return reject(error);
            }else{
                return reject(err);                
            }
        }
    })
}
const requestOAuthCode = (oAuth2Client: any): Promise<Token> => {
    const oAuthBrowser = ChildBrowser.getInstance().getChildBrowser();
    return new Promise((resolve,reject)=>{
        Promise.resolve()
        .then(()=>{
            return new Promise<string>((resolve,reject)=>{
                // Google認証確認画面を表示させるURlを生成する
                const scopes = oAuth2.config.getScopes();
                logger.debug('scopes=', scopes);
                const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes})
                logger.debug('auth url = ', url);
                // Google API 認証情報で設定したリダイレクト先が表示されたときのイベント
                session.defaultSession.webRequest.onBeforeRedirect((details)=>{
                    // 途中で何回かのリダイレクトが起こる都度、リダイレクト先を判定する。
                    const url = details.redirectURL;
                    logger.debug('redirect url = ',url,', oAuth2.config.getRedirect()=',oAuth2.config.getRedirect());
                    if(url.startsWith(oAuth2.config.getRedirect())){
                        // 登録しているリダイレクト先になったとき
                        const urlObj = new URL(url); 
                        const code = urlObj.searchParams.get("code");
                        ChildBrowser.getInstance().clearChildBrowser();
                        if(code) {
                            return resolve(code)
                        }
                        return reject(new Error('code を取得できません'));
                    }
                });
                oAuthBrowser.loadURL(url)

            });
        })
        .then((code)=>{
            // getToken 
            return fetchTokenFromGoogle(oAuth2Client, code);
        })
        .then((token:Token)=>{
            return resolve(token);
        })
        .catch((err)=>{
            return reject(err);
        })
    })
}
const fetchTokenFromGoogle = (oAuth2Client:any, code: string):Promise<Token> => {
    return new Promise((resolve, reject) => {
        oAuth2Client.getToken(code, (err:any, tokens:Token )=>{
            if (err) return reject(err);
            resolve(tokens);
        });
    })
}
class ChildBrowser {
    private static instance: ChildBrowser| null = null;
    static getInstance() : ChildBrowser {
        if(ChildBrowser.instance == null){
            ChildBrowser.instance = new ChildBrowser();
        }
        return ChildBrowser.instance;
    }
    private childBrowser: BrowserWindow | null = null;
    private mainBrowser: BrowserWindow;
    constructor() {
        const browsers = BrowserWindow.getAllWindows()
        this.mainBrowser = browsers[0];
    }
    getChildBrowser(): BrowserWindow {
        if(this.childBrowser == null){
            this.childBrowser = new BrowserWindow({
                parent: this.mainBrowser,
                title: '認証画面',
                modal: true,
            });
            this.childBrowser.loadFile('subBrowser.html');
            this.childBrowser.on("closed", () => (this.childBrowser = null));
        }
        return this.childBrowser;
    }
    clearChildBrowser() {
        if(this.childBrowser){
            this.childBrowser.close();
            this.childBrowser = null;
        }
    }
}

