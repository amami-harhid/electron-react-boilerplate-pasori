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
      fs.writeFileSync(filePath, str, 'utf8');
}
const jsonData = getJsonData();
//const config = require('config');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
//const { google } = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
//const OAuth2 = google.auth.OAuth2;

// --- read conf.json

const user = jsonData.GOOGLE_USER
const clientId = jsonData.GOOGLE_OAUTH_CLIENT_ID
const clientSecret = jsonData.GOOGLE_OAUTH_SECRET
const refresh_token = jsonData.GOOGLE_OAUTH_REFRESH_TOKEN
const access_token = jsonData.GOOGLE_OAUTH_ACCESS_TOKEN
const scopes = [jsonData.GOOGLE_GMAIL_SCOPE];
console.log('clientId=',clientId);
console.log('refresh_token=',refresh_token);
console.log('access_token=',access_token);
const redirect = 'http://localhost/oauth2callback';
// --- OAuthクライアントを作る
const oAuth2Client = new OAuth2Client(
      clientId,               // クライアントID
      clientSecret,           // クライアントシークレット
      redirect      // リダイレクトURIの登録と一致させておく
);
//console.log('oAuth2Client=',oAuth2Client);
// --- トークン再発行を待つ
oAuth2Client.on('tokens', (tokens)=>{
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
      if(jsonData.GOOGLE_OAUTH_ACCESS_TOKEN != tokens.token) {
            jsonData.GOOGLE_OAUTH_ACCESS_TOKEN = tokens.token;
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
const PORT = 80;
app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
});   
const process = () => {

      Promise.resolve()
      .then(()=>{
            return new Promise((resolve,reject)=>{
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
//                  oAuth2Client.getAccessToken().then((value)=>{
//                        resolve(value);
//                  });
            })
      })
      .catch((error)=>{
            console.log('error[1]===========');
            return new Promise((resolve,reject)=>{
                  app.get('/oauth2callback', async (req,res)=>{
                        console.log(req.query)
                        console.log('redirect query = ', req.query)
                        const code = req.query.code;
                        if( code ){
                              const tokens = oAuth2Client.getToken(code,(err, tokens )=>{
                                    if (err) return reject(err);
                                    console.log('getToken=', tokens)
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
            console.log('======= then[1] =====')
            console.log(value);
            const access_token = value.access_token;
            const refres_token = value.refresh_token;
            jsonData.GOOGLE_OAUTH_REFRESH_TOKEN = refres_token;
            jsonData.GOOGLE_OAUTH_ACCESS_TOKEN = access_token;
            saveJsonData(jsonData);
            return new Promise((resolve,reject)=>{

                  resolve(access_token);
            })

      })
      .then((access_token)=>{
            console.log('======= then[2] =====')
            console.log(access_token);
            return new Promise((resolve)=>{
                  resolve(access_token);
            })
      })
      .catch((error)=>{
            console.log('====== error ======');
            console.log(error);
      })

}
process();