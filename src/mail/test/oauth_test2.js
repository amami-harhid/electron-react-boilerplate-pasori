console.log('===== START ========')
//const puppeteer = require('puppeteer');
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
const access_token = jsonData.GOOGLE_OAUTH_ACCESS_TOKEN
const refresh_token = jsonData.GOOGLE_OAUTH_REFRESH_TOKEN
const scopes = [jsonData.GOOGLE_GMAIL_SCOPE];
console.log('clientId=',clientId);
console.log('refresh_token=',refresh_token);

const process = async() => {

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
      const mail_subject = 'アクセストークンなし' // 件名を変えた
      const mail_to = 'it-haranaga@s500.jp';
      const mailOptions = {
            from: user, // 送信元
            to: mail_to, // 送信先
            subject: mail_subject, // 件名
            text: 'てすとめーるです',
            html: '<p>てすと</p><p>めーるです</p>'
      }
      await transporter.sendMail(mailOptions);
}

process();