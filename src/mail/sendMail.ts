import nodemailer from 'nodemailer';
import { ApConfig } from '@/conf/confUtil';
import { Logger } from '@/log/logger';
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
const MAIL_FROM = '"Pasori System" <pasori@mirai-logic.com>'
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
    if(SMTP_SERVER == ''){
        return false;
    }
    // SMTPサーバーの設定
    let transporter = nodemailer.createTransport({
        host: SMTP_SERVER,
        port: SMTP_PORT,
        secure: SMPT_SECURE,
        auth: {
            user: SMTP_ACCOUNT_USER, // メールアドレス
            pass: SMTP_ACCOUNT_PASSWORD // パスワード
        }
    })
    // メール内容の設定
    let mailOptions = {
        from: MAIL_FROM, // 送信元
        to: mail_to, // 送信先
        subject: mail_subject, // 件名
        text: `${name}さんが${text}しました`, // テキスト形式の本文
        html: `<p><strong>${name}</strong>さんが${text}しました</p>` // HTML形式
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
