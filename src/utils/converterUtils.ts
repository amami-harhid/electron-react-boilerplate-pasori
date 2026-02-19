import iconv from 'iconv-lite';

export const convertSjisToUtf8 = (str:string): string => {
    // 「UTF-8 のバイト列」に戻す
    const bytes = Buffer.from(str, "binary");
    // そのバイト列を Shift_JIS としてデコードし直す
    return iconv.decode(bytes, "shift_jis");
}
