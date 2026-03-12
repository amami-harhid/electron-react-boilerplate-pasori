# config.json の中身

`config-sample.json`　を
`appData\roaming\electron-app-pasori` へコピーし
`config.json`とリネームしてください。

## JSON項目

| 項目 | 意味 |  記述要領   |  省略時  |
| --------------- | --------------- | --------------- | --------------- |
| PAGE_TITLE | 表示するタイトル | 全角半角可 | 項目なし OR 空文字のとき(⇒ A )   |
| DB_PATH | DB保存場所 | 実在するフォルダ( / 区切り) | 項目なし、空文字のとき(後述) |
| DB_NAME | DB名称 | 例 pasori.db | 項目なし、空文字のとき(後述) |
| DB_NAME | DB名称 | 例 pasori.db | 項目なし、空文字のとき(後述) |
| MAIL_FROM | 送信元名称 | "\"〇〇〇\"" | 項目なし、空文字のとき(後述) |
| MAIL_SUBJECT_IN | 入室メールの表題 |  | 項目なし、空文字のとき(後述) |
| MAIL_SUBJECT_OUT | 退出メールの表題 |  | 項目なし、空文字のとき(後述) |
| MAIL_TEXT_IN | 入室 |  | 項目なし、空文字のとき(後述) |
| MAIL_TEXT_OUT | 退室 |  | 項目なし、空文字のとき(後述) |
| GOOGLE_GMAIL_SCOPE |  |  | Google OAuthクライアント設定どおり、カンマ区切り |
| GOOGLE_USER | ***@gmail.com |  | Googleアカウント |
| GOOGLE_OAUTH_CLIENT_ID | ***-***.apps.googleusercontent.com |  | Google OAuthクライアントID |
| GOOGLE_OAUTH_REDIRECT |  |  | Google OAuthクライアント設定どおり |
| GOOGLE_OAUTH_SECRET |  |  | 初回のみ |
| GOOGLE_OAUTH_REFRESH_TOKEN |  |  | 初回のみ |
| GOOGLE_OAUTH_ACCESS_TOKEN |  |  | 初回のみ |

## PAGE_TITLE
`PAGE_TITLE`がない、または値が空文字の場合、タイトルは『入退室チェッカー』になります。

## DB_PATH
実在しないフォルダー名の場合は、アプリ起動に失敗します。
`DB_PATH`がない、または値が空文字のときは、DB保存場所は、
`appData\electron-app-pasori`　になります。


## DB_NAME
`DB_NAME`がない、または値が空文字のときは、DB名は、『pasori.sqlite3』になります。


## MAIL_FROM
`MAIL_FROM`がない、または値が空文字のときは、送信元は、
『"Pasori System" <[SMTP_ACCOUNT_USER]@gmail.com>』になります。

ただし、Gmailの場合は、< >の中身が SMTP_ACCOUNT_USER と異なる場合、
Gmail側で SMTP_ACCOUNT_USER へ変更されてしまいますので、存在しない
メールアドレスにするという使い方はできないようです。


## MAIL_SUBJECT_IN
`MAIL_SUBJECT_IN`がない、または値が空文字のときは、入室送信時の表題は、
『入室連絡(Pasori)』になります。

## MAIL_SUBJECT_OUT
`MAIL_SUBJECT_OUT`がない、または値が空文字のときは、退出送信時の表題は、
『退室連絡(Pasori)』になります。

## MAIL_TEXT_IN
メール本文中の「入室しました」の「入室」の部分を指定できます。
`MAIL_TEXT_IN`がない、または値が空文字のときは、文言は、
『入室』になります。

## MAIL_TEXT_OUT
メール本文中の「退室しました」の「退室」の部分を指定できます。
`MAIL_TEXT_OUT`がない、または値が空文字のときは、文言は、
『退室』になります。
