import { useEffect, useState, useContext } from "react";
import { Button } from "@mui/material";
import { titleService } from "@/service/ipcRenderer/titleRenderer";
import { type ReaderIsReadyState, ReaderIsReady } from '@/renderer/pages/readerIsReadyProvider';

/** ページヘッダー部 */
export const Masterhead = () => {
    const [pageTitle, setPageTitle] = useState("");
    const [readerIsReady, setReaderIsReady] = useState(false);
    const [_, setProviderReaderIsReady] = useContext<ReaderIsReadyState>(ReaderIsReady);

    const [readerIsError, setReaderIsError] = useState(false);
    /** Main側でConfigよりタイトルを取り出してRender側で受け取る */
    const loadTitle = async (): Promise<void> => {
        const title = await titleService.getTitle();
        setPageTitle(title);
    }
    const readerStart = async () => {
        if (readerIsReady) {
            return;
        }
        console.log('readerStart!!!');
        window.pasoriCard.startReader();
    }
    const readerForceStart = async () => {
        console.log('readerForceStart!!!');
        window.pasoriCard.startReader(true);
    }
    const readerOnReady = () => {
        window.pasoriCard.readerOnReady(() => {
            setProviderReaderIsReady(true);
            setReaderIsReady(true);
            setReaderIsError(false);
        })
    }
    const readerOnEnd = () => {
        window.pasoriCard.readerOnEnd(() => {
            setProviderReaderIsReady(false);
            setReaderIsReady(false);
            setReaderIsError(false);
        })
    }
    const readerOnError = () => {
        window.pasoriCard.readerOnError(() => {
            setReaderIsError(true);
        })
    }
    // 初回のみタイトルをロードする
    useEffect(() => {
        loadTitle();
        if (readerIsReady == false) {
            readerStart();
            readerOnReady();
            readerOnEnd();
            readerOnError();
        }
    }, []);

    return (
    <>
        <Button variant="contained" color="primary" onClick={readerForceStart}
            style={(readerIsError) ? { display: "inline-block", zIndex:100 } : { display: "none" }}
            >障害中</Button>
        <Button variant="contained" color="primary" disabled={true}
            style={(readerIsError) ? { display: "none" } : { display: "inline-block", color:"#ffffff" }}
        >{(readerIsReady) ? "接続" : "切断"}</Button>
        <h1 className="pageTitle">
            <span>{pageTitle}</span>
        </h1>
    </>
    );
}
