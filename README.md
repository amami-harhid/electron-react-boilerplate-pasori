# electron-react-boilerplate-pasori
IC-Card entry and exit system ( electron-react-boilerplate )

# requirements

- Windows 10 / 11
- Node (20.11.1)
- Visual Studio 2019 Build Tools
- SONY Ferica RC-S380

# Electron

Electron (35.0.2)

# 事前準備

## STEP01 

トップディレクトリにて、
```
npm install
```

## STEP02
`release\app`ディレクトリにて

```
cd release\app
npm install
```

## STEP03
`release\app\sql` ディレクトリを作成
```
cd release\app
mkdir sql
```

# Configファイル
`config\config-sample.json`を`config.json`として
`AppData\Roaming\electron-app-pasori`　へコピーしてください。
`config.json`の中身の説明は、`./config/README.md`をご確認ください。

# 入退室メール
入室時、退出時にカードタッチしたタイミングで、登録されているアドレスへメールを送ります。
メールアドレスを登録していないメンバーの場合は、メール送信しません。

## メール文面の例

Pasori System < >

# 開発環境で起動
npm install
```
npm start
```
# 

```
npm run package
```
