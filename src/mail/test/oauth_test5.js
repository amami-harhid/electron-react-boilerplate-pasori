console.log('===== START ========')
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const configPath = 'C:/Users/user/AppData/Roaming/electron-app-pasori';
const filePath = path.join(configPath, 'config.json');
const getJsonData = ()=>{
      const jsonConfig = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(jsonConfig);
      return jsonData;
}
const saveJsonData = (jsonData) => {
      const str = JSON.stringify(jsonData, null, 2);
      console.log("str=",str);
      fs.writeFileSync(filePath, str, 'utf8');
}
const jsonData = getJsonData();
//const config = require('config');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
//const {OAuth2Client} = require('google-auth-library');
//const OAuth2 = google.auth.OAuth2;

// --- read conf.json

const user = jsonData.GOOGLE_USER
const clientId = jsonData.GOOGLE_OAUTH_CLIENT_ID
const clientSecret = jsonData.GOOGLE_OAUTH_SECRET
const refresh_token = jsonData.GOOGLE_OAUTH_REFRESH_TOKEN
const access_token = jsonData.GOOGLE_OAUTH_ACCESS_TOKEN
const configScope = jsonData.GOOGLE_GMAIL_SCOPE;

const scopes = configScope.split(',');
console.log(scopes);
console.log('clientId=',clientId);
console.log('refresh_token=',refresh_token);
console.log('access_token=',access_token);
const redirect = 'http://localhost/oauth2callback';
// --- OAuthクライアントを作る
const oAuth2Client = new google.auth.OAuth2(
      clientId,               // クライアントID
      clientSecret,           // クライアントシークレット
      redirect      // リダイレクトURIの登録と一致させておく
);
//console.log('oAuth2Client=',oAuth2Client);
// --- トークン再発行を待つ
oAuth2Client.on('tokens', (tokens)=>{
      oAuth2Client.setCredentials(tokens);
      console.log('======= token 再発行 =======')
	console.log('tokens = ', tokens)
      const date = Date.now();
      console.log('今の時刻=', date)
      const expires = tokens.expiry_date - date;
      console.log(expires);
      const _expires = expires / 60 / 60 / 1000; // 時間
      console.log(_expires); // --> 0.9997208333333333 = およそ1時間
      const expiresInDate = new Date(tokens.expiry_date + 9*60*60*1000);
      console.log(expiresInDate);
      
      if(jsonData.GOOGLE_OAUTH_ACCESS_TOKEN != tokens.access_token) {
            jsonData.GOOGLE_OAUTH_ACCESS_TOKEN = tokens.access_token;
            saveJsonData(jsonData);
      }

});
// --- 認証情報を設定
oAuth2Client.setCredentials({
      // access_token未設定のときは getAccessTokenでトークンが変わる？
      access_token: access_token, // 期限切れのトークンのままを設定している
      refresh_token: refresh_token,
      //expiry_date: 1 //Date.now() + 1000*10        // ミリ秒単位 
});
app.set('view engine', 'ejs');
const PORT = 80;
app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
});   
const process = () => {

      Promise.resolve()
      .then(()=>{
            return new Promise( async(resolve,reject)=>{
                  if( refresh_token == undefined || access_token == undefined){
                        return reject(new Error('local token not found'));
                  }
                  try{
                        console.log('========= google.oauth2 start');
                        const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
                        console.log('========= oauth2.userinfo.get start');
                        const { data } = await oauth2.userinfo.get();
                        console.log('oauth2.userinfo.get =',data);

                  }catch(err){
                        console.log('oauth2.userinfo.error');
                        console.log(err);
                        console.log('=================')
                        console.log(err.response.data.error.code);
                        console.log(err.code);
                        console.log('=================')
                        if (err.code == 401 || err.code == 400) {
                              // 401 : 期限切れ、400: 無効
                              console.log('==== reject')
                              return reject(err);
                        }
                  }
                  oAuth2Client.getAccessToken()
                  .then((token)=>{ // token= { token: access_token_str }
                        console.log('getAccessToken.then')
                        console.log(token);
                        resolve(token); 
                  })
                  .catch((err)=>{
                        console.log('getAccessToken.catch')
                        console.log(err);
                  })
/*
                  oAuth2Client.refreshAccessTokenAsync()
                  .then((value)=>{
                        console.log('refreshAccessTokenAsync .then')
                        if(value.response){
                              console.log(value.response);
                        }
                        resolve(value);
                  })
                  .catch((error)=>{
                        console.log('refreshAccessTokenAsync .catch')
                        //console.log(error);
                        reject(error);
                  })
*/ 

            })
      })
      .catch((error)=>{
            console.log('error[1]===========');
            return new Promise((resolve,reject)=>{
                  app.get('/exit', async(req,res)=>{

                  })
                  app.get('/oauth2callback', async (req,res)=>{
                        console.log(req.query)
                        console.log('redirect query = ', req.query)
                        const code = req.query.code;
                        if( code ){
                              oAuth2Client.getToken(code,(err, tokens )=>{
                                    if (err) return reject(err);
                                    console.log('getToken=', tokens)
                                    res.render('tokens', {accessToken: tokens.access_token});
                                    resolve(tokens);

                              });
                              //oAuth2Client.setCredentials({
                              //      access_token: tokens.access_token, // 期限切れのトークンのままを設定している
                              //      refresh_token: tokens.refresh_token,
                              //});
                        }else{
                              reject(new Error('Missing authorization code'));
                        }
                  })
                  app.get('/auth', async (req,res)=>{
                        const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes})
                        console.log("generateAuthUrl=", url);
                        res.redirect(url);
                  });
            });

      })
      .then((value)=>{
            return new Promise((resolve, reject)=>{
                  console.log('======= then[1] =====')
                  console.log(value);
                  if(value.token){
                        const access_token = value.token;
                        jsonData.GOOGLE_OAUTH_ACCESS_TOKEN = access_token;
                        saveJsonData(jsonData);
                        const tokens = {access_token: ''};
                        tokens.access_token = access_token;
                        resolve(tokens);

                  }else
                  if(value.credentials){
                        const access_token = value.credentials.access_token;
                        const refresh_token = value.credentials.refresh_token;
                        jsonData.GOOGLE_OAUTH_REFRESH_TOKEN = refresh_token;
                        jsonData.GOOGLE_OAUTH_ACCESS_TOKEN = access_token;
                        saveJsonData(jsonData);
                        const tokens = {access_token: '', refresh_token: ''};
                        tokens.access_token = access_token;
                        tokens.refresh_token = refresh_token;
                        resolve(tokens);

                  }else{
                        const tokens = {access_token: '', refresh_token: ''};
                        if(value.access_token){
                              jsonData.GOOGLE_OAUTH_ACCESS_TOKEN = value.access_token;
                              tokens.access_token = value.access_token;
                        }
                        if(value.refresh_token){
                              jsonData.GOOGLE_OAUTH_REFRESH_TOKEN = value.refresh_token;
                              tokens.refresh_token = value.refresh_token;
                        }
                        if(value.access_token || value.refresh_token){
                              saveJsonData(jsonData);
                              resolve(tokens)
                        }else{
                              reject(new Error('token情報がない'));
                        }
                  }

            })

      })
      .then((tokens)=>{
            console.log('======= then[2] =====')
            console.log(tokens);
            return new Promise((resolve)=>{
                  console.log('access_token=', tokens.access_token);
                  console.log('refresh_token=', tokens.refresh_token)
                  resolve(tokens);
            })
      })
      .catch((error)=>{
            console.log('====== error ======');
            console.log(error);
      })

}
process();