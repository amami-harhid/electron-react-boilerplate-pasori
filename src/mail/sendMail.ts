    import nodemailer from 'nodemailer';
    import { ApConfig } from '@/conf/confUtil';
    import { oAuth2 } from '@/oauth/oauth2';
    
    import { Logger } from '@/log/logger';
    import { dateDateTime } from '@/utils/dateUtils';
    import { type TAuth, Auth } from './oauth';
    import type { NodemailerError } from './nodemailerError';
    const logger = new Logger();

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
    const SEND_MAILER =
        async ( mail_to:string, mail_subject:string, text:string, name:string ):Promise<boolean> =>{
        const auth:TAuth = {
            type: "OAuth2",
            user: oAuth2.config.getUser(),
            clientId: oAuth2.config.getClientId(),
            clientSecret: oAuth2.config.getClientSecret(),
            refreshToken: oAuth2.config.getRefreshToken(),
            accessToken: oAuth2.config.getAccessToken(), 
        }
        const transport = {
            service: "gmail",
            auth: auth,
        }
        console.log('transport=', transport);
        // SMTPサーバーの設定
        const transporter = nodemailer.createTransport(transport)
        const now = new Date();
        const currentDateTime = dateDateTime(now)
        // メール内容の設定
        const fromAddress = ApConfig.get("MAIL_FROM")+`<${oAuth2.config.getUser()}>`;
        let mailOptions = {
            from: fromAddress, // 送信元
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
