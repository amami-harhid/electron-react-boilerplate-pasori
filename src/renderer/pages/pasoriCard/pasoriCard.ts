type CallBack = (...args:any[]) => Promise<void>;
export const onRelease = async (fn: CallBack) => {
    // カードが離れたときの処理
    window.pasoriCard.onRelease(fn);
}
export const onTouch = (fn:CallBack) => {
    // カードタッチしたときの処理
    window.pasoriCard.onTouch(fn);
}
