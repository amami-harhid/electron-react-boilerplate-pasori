# requirements 

## for npm install

Node (20.11.1)

Visual Studio 2019 Build Tools

## Electron

Electron (35.0.2)

# Pasori CardReader

```
Fefica RC-S380
```

# Build Steps

## Step01

プロジェクトトップにて

```
npm install
```
```
npm ERR! code 1
npm ERR! path ～～\electron-react-boilerplate-pasori\release\app\node_modules\@pokusew\pcsclite
npm ERR! command failed
```
`pcsclite`の辺りでエラーが起きるので、Step02で、`sqlite3`,`pcsclite`をコンパイルする。

## Step02

```
cd release/app
npm install
```
## Step03
再び、トップで `npm install`

```
npm install
```

以上で終わり。