import { useEffect, useState, useContext } from "react";
import { toast } from 'sonner';
import { topPageService } from '@/service/ipcRenderer/topPageRenderer';
import * as PasoriCard from '@/renderer/pages/pasoriCard/pasoriCard';
import { HistoriesMemberIdmRow } from "@/db/historiesRow";
import { type ReaderIsReadyState, ReaderIsReady } from './readerIsReadyProvider';
import * as Sounds from "@/renderer/lib/sounds";

type View = {
  pageTitle: string,
  name: string,
  status: string,
  modal_display: string,
  is_ready: boolean,
  card_display: string,
  error_display: string,
  errorMessage01: string,
  errorMessage02: string,
}

const Display = {
  block: 'block',
  inline_block: 'inline-block',
  none: 'none',
} as const;

const initView: View = {
  pageTitle: '入退室チェッカー',
  name: '',
  status : '',
  modal_display : Display.none,
  is_ready: false,
  card_display: Display.block,
  error_display: Display.none,
  errorMessage01: '',
  errorMessage02: '',
} as const;


export function TopPage() {

    const [view, setView] = useState(initView);
    const [providerReaderIsReady,setProviderReaderIsReady] = useContext<ReaderIsReadyState>(ReaderIsReady);
    const setPageView = ( _view: View ) => {
        const _clone = structuredClone(_view);
        setView(_clone);
    }
    const cardsSelectCardRow = async (idm:string): Promise<HistoriesMemberIdmRow | undefined> => {
        const row: HistoriesMemberIdmRow = await topPageService.getMemberByIdm(idm);
        return row;
    };
    const setInRoom = async(fcno:string, idm: string) : Promise<void> => {
        // Cards/履歴を更新
        await topPageService.setInRoomByFcno(fcno, idm, true);
    }
    const setOutRoom = async(fcno:string, idm: string) : Promise<void> => {
        await topPageService.setInRoomByFcno(fcno, idm, false);
    }

    const sendMail = async (row:HistoriesMemberIdmRow, in_room:boolean) => {
        const mailResult = await topPageService.sendMail(row.mail, in_room, row.name);
        console.log('mail send done')
        if(mailResult==false){
            toast.warning('メール送信失敗');
        }
    }

    /** カードリリース */
    const cardRelease = () => {
        console.log('cardRelease');
        view.status = '';
        view.modal_display = Display.none;
        setPageView(view);
    }
    /** カードタッチ */
    const cardTouch = async (idm :string) => {
        console.log(idm)
        if(idm.length==0){
            console.log('cardTouch none');
            // 安全のために空チェック
            return;
        }
        // idmが登録されている利用者を取得する
        const row = await cardsSelectCardRow(idm);
        console.log('row=',row);
        if(row) {
            const fcno = row.fcno;
            if( row.in_room == true ) {
                // 入室中
                console.log('row=',row);
                Sounds.play({name:"CARD_OUT"})
                setOutRoom( fcno, idm);
                toast.success('退室');
                if(row.mail != ''){
                    // 退室通知メール
                    sendMail(row, false);
                }
                view.status = '退室しました';
                view.name = `(${row.name}さん)`;
            }else{
                // 退室中
                console.log('row=',row);
                Sounds.play({name:"CARD_IN"});
                setInRoom( fcno, idm);
                toast.success('入室');
                if(row.mail != ''){
                    // 入室通知メール                    
                    sendMail(row, true);
                }
                view.status = '入室しました';
                view.name = `(${row.name}さん)`;
            }
        }else{
            Sounds.play({name:"CARD_NG"})
            view.status = `未登録カード(${idm})`;
            view.name = ``
        }
        view.modal_display = Display.block;
        setPageView(view);

    }
    /** カードリーダー準備完了確認 */
    const isReaderReady = () => {
        const isReady = providerReaderIsReady;
        view.is_ready = isReady;
        if(isReady){
            view.card_display = Display.block;
            view.error_display = Display.none;
            view.errorMessage01 = ``;
            view.errorMessage02 = ``;
            // カードリーダー接続していたらリッスン開始
            toast.info('リーダー準備完了');
            cardTouchListenerStart();
            setPageView(view);
        }else{
            view.modal_display = Display.block;
            view.card_display = Display.none;
            view.error_display = Display.block;
            view.errorMessage01 = `カードリーダーの接続を確認できません。`;
            view.errorMessage02 = `障害中の場合はアプリを再起動してください`;
            toast.error('リーダー未接続');
            setPageView(view);
        }
    }

    const cardTouchListenerStart = () => {
        // カードが離れたときの処理
        PasoriCard.onRelease( async(ipc_idm:string)=>{
            cardRelease();
        });

        // カードタッチしたときの処理
        PasoriCard.onTouch( async (idm:string)=>{
            await cardTouch(idm);
        });
    }
    const soundInitPlay = async () => {
        console.log('CARD_IN start');
        await Sounds.play({name:"CARD_IN"},{volume:0.9});
        console.log('CARD_OUT start');
        await Sounds.play({name:"CARD_OUT"},{volume:0.1});
        console.log('CARD_NG start');
        await Sounds.play({name:"CARD_NG"},{volume:0.1});
    }
    // mainMasterhead.tsx でリーダー接続状況を検知している
    // Provider でグローバル共有している。
    // 接続状況(providerReaderIsReady)が変化したら再レンダリングを行う。
    useEffect(()=>{
        soundInitPlay();
        view.modal_display = Display.none;
        console.log('In useEffect view.modal_display=',view.modal_display);
        isReaderReady();
    },[providerReaderIsReady]);

    return (
        <>
        {/* モーダル */}
        <div className="modal" style={{display: view.modal_display}}>
            <div className="modal-content">
                <div className="card" style={{display: view.card_display}}>
                    <p>{view.status}</p>
                    <p>{view.name}</p>
                </div>
                <div className="card" style={{display: view.error_display}}>
                    <p className="errorMessage">{view.errorMessage01}</p>
                    <p className="errorMessage">{view.errorMessage02}</p>
                </div>
            </div>
        </div>
        </>
    );
}
