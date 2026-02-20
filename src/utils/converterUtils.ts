import iconv from 'iconv-lite';
/**
 * WindowsOSからくるメッセージ文が文字化けするので
 * 復旧させようと苦戦したときの残骸です。
 * 文字化けは復旧できずでした。
 * 使われていないメソッドです。
 */
export const convertSjisToUtf8 = (str:string): string => {
    // 「UTF-8 のバイト列」に戻す
    const bytes = Buffer.from(str, "binary");
    // そのバイト列を Shift_JIS としてデコードし直す
    return iconv.decode(bytes, "shift_jis");
}
