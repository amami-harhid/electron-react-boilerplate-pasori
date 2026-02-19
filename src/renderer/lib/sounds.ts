import { BASEPATH_DEV } from "./soundConf";
import { soundRecords } from './soundsRecord';

/** Audioのキャッシュ */
const audioCache: Record<string, HTMLAudioElement> = {};

/** 音を事前に読み込む */
export const preload = async () => {
    
    /** 製品ビルド(true)、開発ビルド(false) */
    const isProduction = await window?.buildEnv.isProduction();
    /** assetsの絶対パス */
    const assetsPath = await window?.buildEnv.getAssetsPath();

  	Object.keys(soundRecords).forEach((name) => {
        if (!audioCache[name]) {
            const sound = soundRecords[name];
            // 製品ビルドのときは絶対パスにする
            const url = (isProduction)?`${assetsPath}/${sound.url}`:`${BASEPATH_DEV}/${sound.url}`;
            //const url = `${assetsPath}/${sound.url}`;
            audioCache[name] = new window.Audio();
		    audioCache[name].crossOrigin = '*';
			audioCache[name].volume = sound.volume;
			audioCache[name].src = url;
        }
    });
};

/** 音を鳴らす */
export const play = async({ name }: { name: string }) => {
    const sound = name.toUpperCase();
	//console.info(`Playing sound: ${name}`);

	let audio: HTMLAudioElement | undefined = audioCache[sound];
	if (!audio) {
		preload();
		audio = audioCache[sound];
	}

	if (audio) {
		audio.currentTime = 0;
		audio.play().catch(console.error);
	}
};
