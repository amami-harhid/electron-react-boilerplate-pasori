    import nodemailer from 'nodemailer';
    import { ApConfig } from '@/conf/confUtil';
    import { OAuthInfo, GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_OAUTH_ACCESS_TOKEN } from './oauthInfo';
    import { Logger } from '@/log/logger';
    import { dateDateTime } from '@/utils/dateUtils';
    import { type TAuth, Auth } from './oauth';
    import type { NodemailerError } from './nodemailerError';
    const logger = new Logger();

    // user は googleアカウントの@の左側です
    // pass は googleアカウント管理画面内で
    // 二段階認証有効としたうえで、同画面内で
    // アプリケーションパスワードとして設定したものです。
    // Googleアカウントのパスワードではありません。
    const SMTP_ACCOUNT_USER = (ApConfig.has("SMTP_ACCOUNT_USER"))?
            ApConfig.get("SMTP_ACCOUNT_USER"):"";


    //'"Pasori System" <pasori@mirai-logic.com>'

    // 件名
    const MAIL_SUBJECT = {
        IN: (ApConfig.has("MAIL_SUBJECT_IN"))?
            ApConfig.get("MAIL_SUBJECT_IN"):"入室連絡(Pasori)",
        OUT: (ApConfig.has("MAIL_SUBJECT_OUT"))?
            ApConfig.get("MAIL_SUBJECT_OUT"):"退室連絡(Pasori)",
    }
    // 本文
    const MAIL_TEXT = {
        IN: (ApConfig.has("MAIL_TEXT_IN"))?
            ApConfig.get("MAIL_TEXT_IN"):"入室",
        OUT: (ApConfig.has("MAIL_TEXT_OUT"))?
            ApConfig.get("MAIL_TEXT_OUT"):"退室",
    }

    const SEND_MAILER = (mail_to:string, mail_subject:string, text:string, name:string ) :boolean =>{
        console.log('SEND MAILER START')
        const auth = new Auth();
        console.log('SEND MAILER new Auth()')
            console.log('SEND MAILER START Promise start')
            auth.authenticate(async ():Promise<void>=>{
                //const accessToken = await auth.getAccessToken();
                //console.log('accessToken=', accessToken);
                console.log('OAuthInfo=',OAuthInfo)
                const _auth:TAuth = {
                    type: "OAuth2",
                    user: OAuthInfo.user(),
                    clientId: OAuthInfo.clientId(),
                    clientSecret: OAuthInfo.clientSecret(),
                    refreshToken: OAuthInfo.refreshToken(),
                    //accessToken: OAuthInfo.accessToken, // アクセストークンは使わない。
                }
                try{
                    await _SEND_MAILER(auth, _auth, mail_to, mail_subject, text, name);
                    return
                }catch(error){
                    const mailError = error as NodemailerError
                    throw mailError;
                }

            })
        return true;
    }
    const _SEND_MAILER =
        async ( Auth: Auth, auth: TAuth, mail_to:string, mail_subject:string, text:string, name:string ):Promise<boolean> =>{
        //const accessToken = await Auth.getAccessToken();
        //console.log("accessToken=",accessToken)
        const transport = {
            service: "gmail",
            auth: auth,
        }
        console.log('transport=', transport);
        // SMTPサーバーの設定
        const transporter = nodemailer.createTransport(transport)
        const now = new Date();
        const currentDateTime = dateDateTime(now)
        const MAIL_FROM = (ApConfig.has('MAIL_FROM'))?ApConfig.get('MAIL_FROM'):`"Pasori" <${auth.user}>`
        // メール内容の設定
        let mailOptions = {
            from: auth.user, //MAIL_FROM, // 送信元
            to: mail_to, // 送信先
            subject: mail_subject, // 件名
            text: 
    `${name}さんが${text}しました
    (${currentDateTime})

    ※このメールには返信できません

    ============================
    iTeen奄美ティダモール校
    amami-thidamall@iteen.jp`, // テキスト形式の本文

            html: `<p><strong>${name}</strong>さんが${text}しました</p>
                <p>(${currentDateTime})</p>
                <p>※このメールには返信できません</p>
                <p>==========================</p>
                <p>iTeen奄美ティダモール校</p>
                <p>amami-thidamall@iteen.jp</p>` // HTML形式
        }

        try {
            console.log(mailOptions)
            await transporter.sendMail(mailOptions);
            logger.debug("メールが送信されました:", mailOptions)
        } catch (error) {
            const mailError = error as NodemailerError;
            console.log('error.code=', mailError.code);
            logger.error('error.message', mailError.message)
            throw mailError;
        }
        return true;
    }


    export const Mailer = {
        subject: MAIL_SUBJECT,
        text: MAIL_TEXT,
        sendMail: SEND_MAILER,
    }
