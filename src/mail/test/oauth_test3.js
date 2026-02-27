console.log('===== START ========')
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// --- read conf.json
const path = "C:/Users/user/AppData/Roaming/electron-app-pasori";
const jsonData = require(path+'/config.json');
console.log(jsonData.GOOGLE_USER);

const user = jsonData.GOOGLE_USER
const clientId = jsonData.GOOGLE_OAUTH_CLIENT_ID
const clientSecret = jsonData.GOOGLE_OAUTH_SECRET
const refresh_token = jsonData.GOOGLE_OAUTH_REFRESH_TOKEN
const access_token = jsonData.GOOGLE_OAUTH_ACCESS_TOKEN
const scopes = [jsonData.GOOGLE_GMAIL_SCOPE];
console.log('clientId=',clientId);
console.log('refresh_token=',refresh_token);
console.log('access_token=',access_token);

// --- OAuthクライアントを作る
const oAuth2Client = new google.auth.OAuth2(
      clientId,               // クライアントID
      clientSecret,           // クライアントシークレット
      "http://localhost"      // リダイレクトURIの登録と一致させておく
);
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

});
// --- 認証情報を設定
oAuth2Client.setCredentials({
      access_token: access_token, // 期限切れのトークンのままを設定している
      refresh_token: refresh_token,
      //expiry_date: 1
});

const process = async() => {

    //const _access_token = await oAuth2Client.getAccessToken();
    //console.log('__access_token=', _access_token.token);
      const _token_info = await oAuth2Client.getTokenInfo(
            oAuth2Client.credentials.access_token
      );
    console.log('_token_info', _token_info);
//    const isExpired = await oAuth2Client.isExpired(access_token);
//    console.log('isExpired=', isExpired);
//    if(isExpired){
//          await oAuth2Client.refreshAccessTokenAsync();
//    }
    const auth = {
                type: "OAuth2",
                user: user,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refresh_token,
                //accessToken: access_token,
            }
      const transport = {
            service: "gmail",
            auth,
      }
      const transporter = nodemailer.createTransport(transport)
      const mail_subject = 'Token再発行' // 件名を変えた
      const mail_to = 'it-haranaga@s500.jp';
      const mailOptions = {
            from: user, // 送信元
            to: mail_to, // 送信先
            subject: mail_subject, // 件名
            text: 'てすとめーるです',
            html: '<p>てすと</p><p>めーるです</p>'
      }
      // AccessToken有効期限切れのとき、sendMail()のなかで
      // AccessToken再発行をする。再発行の結果は on('tokens',(tokens)=>{})
      // のなかで検知させている
      await transporter.sendMail(mailOptions);
}

process();