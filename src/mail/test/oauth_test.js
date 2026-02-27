console.log('===== START ========')
const puppeteer = require('puppeteer');
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


oAuth2Client = new OAuth2(
    clientId,
    clientSecret,
    "http://localhost"
);
oAuth2Client.on('tokens', (tokens)=>{
	console.log('on tokens = ', tokens)
});

const tokenAndAuthenticated = {
    token: {
        access_token: access_token,
        refreshToken: refresh_token,
    }
}

const auth = () => {
	Promise.resolve()
    .then(()=>{
        return new Promise(async (resolve)=>{
            const browser = await puppeteer.launch({
                headless: false,
            })
            const page = await browser.newPage();
            resolve(page);
        })
    })
    .then((page)=>{
        return new Promise(async (resolve)=>{
            const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes});
            console.log('url=',url)
                const tokenAndAuthenticated = {
                    token: {
                        refreshToken : refresh_token
                    }
                }
                resolve(tokenAndAuthenticated);
            page.on('response', (response)=>{
                console.log(response);
                if (response.request().isNavigationRequest() && response.request().redirectChain().length > 0) {
                }
            })
            //await page.goto(url);
            //const refresh_token = '4/0AfrIepAfnh7UcQAKmrnH62smLg_y20ZgxNZXzjrj4Kqw4cCVr8cXRG4yOmR8qCSsf4XskQ'
            resolve(tokenAndAuthenticated);
        })
    })
	.then((tokenAndAuthenticated)=>{
      return setAuthenticatedAndCredentials(tokenAndAuthenticated);
	})
    .then(async(token)=>{
//      const accessToken = await oAuth2Client.getAccessToken();
//      console.log("accessToken====>", accessToken);
//      token.access_token = accessToken
      return sendMail(token.access_token)
  })
  .catch(async ()=>{
      return new Promise( async (resolve, reject)=>{
          try{
              console.log('start getAccessToken')
              const accessToken = await oAuth2Client.getAccessToken();
              console.log('accessToken=', accessToken);
              return resolve();
          }catch(error){
            if(error.code == '401') {
                console.log('re getAccessToken');
                await oAuth2Client.getAccessToken();
                return reject(error);
            }
            throw error
          }

      })
  })
  .catch((error)=>{
      console.log('============ error ==============')
      console.log(error.code);
  })
}

auth();

const setAuthenticatedAndCredentials = (tokenAndAuthenticated)=>{
    return new Promise((resolve) => {
        console.log('tokenAndAuthenticated=',tokenAndAuthenticated)
        const p = {
            access_token: tokenAndAuthenticated.token.access_token,
            refresh_token: tokenAndAuthenticated.token.refreshToken,
            //expiry_date: new Date() + 1000*60*60*24, // 強制的に期限切れにする
        }
        console.log('p=', p);
        oAuth2Client.setCredentials(p);
        resolve(tokenAndAuthenticated.token)
    });
}

const sendMail = (accessToken) => {
  return new Promise( async(resolve, reject)=>{
      const auth = {
                type: "OAuth2",
                user: user,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refresh_token,
                accessToken: accessToken,
            }
      const transport = {
            service: "gmail",
            auth,
      }
      console.log('transport=', transport);
      const transporter = nodemailer.createTransport(transport)
      const mail_to = 'it-haranaga@s500.jp';
      const mail_subject = 'てすと';
      const mailOptions = {
            from: user, // 送信元
            to: mail_to, // 送信先
            subject: mail_subject, // 件名
            text: 'てすとめーるです',
            html: '<p>てすと</p><p>めーるです</p>'
      }
      console.log(mailOptions)
      try{
          console.log('======== start sendMail ========')
          await transporter.sendMail(mailOptions);
          return resolve();
      }catch(error){
          console.log('======== error sendMail ========', error.code)
          console.log(error);
          return reject(error);
      }
  });
}
