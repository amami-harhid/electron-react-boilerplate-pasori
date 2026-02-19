import { app } from 'electron';
import path from 'path';
export const resources = app.isPackaged
	? path.join(process.resourcesPath, 'assets')
	: path.join(__dirname, '../../assets');
