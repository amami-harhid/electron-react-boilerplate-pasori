//import { rimrafSync } from 'rimraf';
import * as rimraf from 'rimraf';
const rimrafSync = rimraf.sync;
import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';

const foldersToRemove = [
  webpackPaths.distPath,
  webpackPaths.buildPath,
  webpackPaths.dllPath,
];
foldersToRemove.forEach((folder) => {
  if (fs.existsSync(folder)) rimrafSync(folder);
});
