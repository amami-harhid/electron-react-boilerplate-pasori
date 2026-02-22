    import nodemailer from 'nodemailer';
    import { ApConfig } from '@/conf/confUtil';
    import { Logger } from '@/log/logger';
    import { dateDateTime } from '@/utils/dateUtils';
    import { type TAuth, Auth } from './oauth';
    const logger = new Logger();

    const SMTP_SERVER = (ApConfig.has("SMTP_SERVER"))?
            ApConfig.get("SMTP_SERVER"):"";
    const SMTP_PORT = (ApConfig.has("SMTP_PORT"))?
            ApConfig.get("SMTP_PORT"):456;
    // trueの場合はSSL/TLSを使用
    const SMPT_SECURE = (ApConfig.has("SMPT_SECURE"))?
            ApConfig.get("SMPT_SECURE"):true;
    // user は googleアカウントの@の左側です
    // pass は googleアカウント管理画面内で
    // 二段階認証有効としたうえで、同画面内で
    // アプリケーションパスワードとして設定したものです。
    // Googleアカウントのパスワードではありません。
    const SMTP_ACCOUNT_USER = (ApConfig.has("SMTP_ACCOUNT_USER"))?
            ApConfig.get("SMTP_ACCOUNT_USER"):"";
    const SMTP_ACCOUNT_PASSWORD = (ApConfig.has("SMTP_ACCOUNT_PASSWORD"))?
            ApConfig.get("SMTP_ACCOUNT_PASSWORD"):"";

    // 送信元
    const MAIL_FROM_DEFAULT = `"Pasori System" <${SMTP_ACCOUNT_USER}@gmail.com>`
    const MAIL_FROM = (ApConfig.has("MAIL_FROM"))?ApConfig.get("MAIL_FROM"):MAIL_FROM_DEFAULT;

    console.log(MAIL_FROM)
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

    const SEND_MAILER = async (mail_to:string, mail_subject:string, text:string, name:string ):Promise<boolean> =>{

        const auth = new Auth();
        return new Promise<boolean>((resolve, reject)=>{
            auth.authenticate(async (auth: TAuth)=>{
                await _SEND_MAILER(auth, mail_to, mail_subject, text, name);
                resolve(true);

            })
        });

    }
    const _SEND_MAILER =
        async ( auth: TAuth, mail_to:string, mail_subject:string, text:string, name:string ):Promise<boolean> =>{

        if(SMTP_SERVER == ''){
            return false;
        }

        const transport = {
            service: "gmail",
            auth
        }

        // SMTPサーバーの設定
        let transporter = nodemailer.createTransport(transport)
        const now = new Date();
        const currentDateTime = dateDateTime(now)
        // メール内容の設定
        let mailOptions = {
            from: MAIL_FROM, // 送信元
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
            await transporter.sendMail(mailOptions);
            logger.debug("メールが送信されました:", mailOptions)
        } catch (error) {
            logger.error("エラーが発生しました:", error)
            return false;
        }
        return true;
    }


    export const Mailer = {
        subject: MAIL_SUBJECT,
        text: MAIL_TEXT,
        sendMail: SEND_MAILER,
    }
