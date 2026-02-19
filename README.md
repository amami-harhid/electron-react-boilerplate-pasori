# lectron-react-boilerplate-pasori
IC-Card entry and exit system ( electron-react-boilerplate )

# requirements for npm install

Node (20.11.1)

Visual Studio 2019 Build Tools

# Electron

Electron (35.0.2)

# start

```
npm start
```

# package

```
npm run package
```

## packageする前の対応

### .erb/scripts/clean.js

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

### .erb\scripts\notarize.js

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