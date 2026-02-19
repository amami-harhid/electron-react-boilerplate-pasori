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

# pakageのための対処

## packageする前の対応の記録

#### Error-1
```
.erb\scripts\clean.js:14
foldersToRemove.forEach((folder) => {
                ^
TypeError: rimrafSync is not a function
```
#### 対応
```:.erb/scripts/clean.js
//import { rimrafSync } from 'rimraf';
import * as rimraf from 'rimraf';
const rimrafSync = rimraf.sync;
```

#### Error

```
⨯ Unable to `require`  moduleName=～.erb\scripts\notarize.js message=require() of ES Module 
```

#### 対応

```:.erb\scripts\notarize.js
//const { notarize } = require('@electron/notarize');
const { notarize } = import('@electron/notarize'); // 動的にしないとエラーになる
```

## .erb\config\webpack.config.renderer.dev.ts

#### 対応

開発時に 静的にassetsの中を参照できない問題があるので、publicPathを変える。

```:.erb\config\webpack.config.renderer.dev.ts
devServer: {
    static: {
      publicPath: '/',
    },
```
↓
```:.erb\config\webpack.config.renderer.dev.ts
devServer: {
    static: {
      directory: path.join(__dirname, '../../assets'),
      publicPath: '/static',
    },
```
開発時、`./static/～`とすると、./assetsのなかにアクセスできる

`/src/renderer/lib/soundConf.ts`にて利用している。
