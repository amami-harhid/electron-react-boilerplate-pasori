import { useRef, useEffect, useState, ChangeEvent } from "react";
import Modal from 'react-modal';
import { MaterialReactTable, type MRT_Row } from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { styled } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import AddCardIcon from '@mui/icons-material/AddCard';
import { toast } from 'sonner';
import * as Sounds from "@/renderer/lib/sounds";

import { memberCardListService } from "@/service/ipcRenderer/memberCardListRenderer";
import * as PasoriCard from '@/renderer/pages/pasoriCard/pasoriCard';

type TABLE_ROW = {
    no:number,
    fcno:string,
    name:string,
    kana:string,
    idm:string,
    soft_delete: number, // DB実値(boolean)が (0, 1) であるため,numberとしている
}
/** チェックボックス値 */
const CHECK_BOX = {
    LOGICAL_DELETE: 'LOGICAL_DELETE',
} as const 
type T_CHECK_BOX = (typeof CHECK_BOX)[keyof typeof CHECK_BOX]

/** ページ情報のタイプ定義 */
type PAGEINFO = {
    tableData: TABLE_ROW[],
    isCardRegistModalOpen: boolean,
    isCardRemoveModalOpen: boolean,
    isCardRegistDone: boolean,
    textCardRegistModal: string,
    checkbox: T_CHECK_BOX[],
    tempData: TABLE_ROW,
    counter: boolean,
}

/** ページ情報の初期値 */
const initPageInfo: PAGEINFO = {
    tableData: [],
    isCardRegistModalOpen: false,
    isCardRemoveModalOpen: false,
    isCardRegistDone:false,
    textCardRegistModal: '',

    checkbox: [],
    tempData: {no: 0, fcno:'', name:'', kana:'', idm: '', soft_delete: 0},
    counter: false,
};

const ModalAlertButton = styled(Button)(({ theme })=> ({
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "white",
    background: "#ff0000",
    "&:hover": {
        background: "#b00000",
        transform: "scale(1.05)"
    }
}));
const ModalButton = styled(Button)(({ theme })=> ({
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    color: "white",
    background: "#4CAF50",
    "&:hover": {
        background: "#45a049",
        transform: "scale(1.05)"
    }
}));

export function MemberCardListPage () {
    const [pageInfo, setPageInfo] = useState<PAGEINFO>(initPageInfo);
    const updatePageInfo = ( info: PAGEINFO ) => {
        const _clone = structuredClone(info);
        setPageInfo(_clone);
    }
    const redrawPageInfo = ( info: PAGEINFO ) => {
        info.counter = !(info.counter);
        updatePageInfo(info);
    }
    const content = useRef(null);
    const element = content.current
    if(element){
        Modal.setAppElement(element);
    }

    // Define columns
    const columns = [
        {
            accessorKey: 'no',
            header: 'NO',
            size: 20,
            minSize: 20,
            maxSize: 20,
            enableSorting: false,
        },
        {
            accessorKey: 'fcno',
            header: 'FCNO',
            size: 80,
            minSize: 80,
            maxSize: 80,
            enableSorting: false,
        },
        {
            accessorKey: 'name',
            header: '名前',
            size: 150,
            minSize: 150,
            maxSize: 200,
            enableSorting: false,
        },
        {
            accessorKey: 'kana',
            header: 'カナ',
            size: 150,
            minSize: 150,
            maxSize: 200,
        },
        {
            accessorKey: 'idm',
            header: 'カード',
            size: 50,
            minSize: 50,
            maxSize: 80,
            enableSorting: false,
        }
    ];

    const logicalDeleteChanged = (e: ChangeEvent<HTMLInputElement>) => {
        const checkVal:T_CHECK_BOX = e.target.value as T_CHECK_BOX;
        if( e.target.checked ) {
            pageInfo.checkbox = [checkVal];
            // 複数あるときは
            // pageInfo.checkbox =
            //     [...pageInfo.checkbox, checkVal] 
        }else{
            pageInfo.checkbox = []; 
            // 複数あるときは
            // pageInfo.checkbox =
            //     pageInfo.checkbox.filter((item)=>item!=checkVal) 
        }
        redrawPageInfo(pageInfo);
    }

    const handleRegistCancel = () =>{
        pageInfo.isCardRegistModalOpen = false;
        pasoriCardListenClear();
        updatePageInfo(pageInfo);
    }

    const pasoriCardReleaseListenStart = () => {
        // カードが離れたときの処理
        PasoriCard.onRelease(async()=>{
            //console.log('カードが離れた')
            pageInfo.tempData.idm = '';
            pageInfo.isCardRegistModalOpen = false;
            pasoriCardListenClear();
            redrawPageInfo(pageInfo);
        });

    }
    const pasoriCardListenStart = () => {
        console.log('pasoriCardListen Start')

        // カードタッチしたときの処理
        PasoriCard.onTouch(async (idm:string)=>{
            console.log('memberCardListPage, PasoriCard.onTouch idm=',idm);

            pasoriCardReleaseListenStart(); //タッチした直後にカードリリースをリッスン開始
            pageInfo.tempData.idm = idm;
            const fcno = pageInfo.tempData.fcno;
            // カード情報とともにメンバー情報を取得
            // タッチされたIDMがどこに紐づいているのかを知るためにIDM指定で取り出す
            const idmRow = await memberCardListService.getIdm(idm);
            console.log('idmRow=',idmRow)
            if(idmRow) {
                if(idmRow.fcno != fcno) {
                    // IDMが紐づいたFCNOが異なるとき
                    // すでに利用されているカードである
                    //Sounds.play(({name:"CARD_NG"}));
                    pageInfo.textCardRegistModal = '他で使用済';
                    toast.warning('カード使用済');
                }else{
                    // タッチしたIDMが選択ユーザのFCNOと一致するので
                    // ユーザ自身に紐づいている。
                    // これはロジック的にありえない状態である。
                    // 例外などにはせずにそのままスルーさせる。
                    Sounds.play(({name:"CARD_NG"}));
                    pageInfo.textCardRegistModal = '自身で使用済';
                    toast.error('カード使用済');
                }
            }else{
                // IDMは未登録
                const result = await memberCardListService.setIdmByFcno(fcno, idm);
                console.log('CardTouch result=',result);
                if(result){
                    pageInfo.textCardRegistModal = '登録完了';
                    pageInfo.isCardRegistDone = true; // カード登録完了
                    Sounds.play(({name:"CARD_IN"}));
                    toast.success('登録完了');
                }else{
                    // ここに到達するのは、DB例外（SQLエラー含む）の場合
                    // 及び SQLミスによりカード登録更新件数＝０の場合
                    // に限られるはず。到達してはいけないのだが、
                    // ここではスルーする。
                    pageInfo.textCardRegistModal = '登録失敗';
                    Sounds.play(({name:"CARD_NG"}));
                    toast.error('登録失敗');
                }
            }
            redrawPageInfo(pageInfo);
        });
    }
    /** 一覧で登録ボタンを押したときの処理 */ 
    const handleRegist = (row: MRT_Row<TABLE_ROW> ) => {
        // カードIDM登録待ちモーダルを表示する
        console.log('memberCardListPage, handleRegist');
        pageInfo.textCardRegistModal = '登録したいカードでタッチ'
        pageInfo.isCardRegistModalOpen = true;
        pageInfo.isCardRegistDone = false; // カード登録未了
        pageInfo.tempData.fcno = row.original.fcno;
        pageInfo.tempData.name = row.original.name;
        // 登録待ちモーダルを表示すると同時に「カードタッチ」のリッスンを開始
        pasoriCardListenStart();
        updatePageInfo(pageInfo);
    };
    /** カード登録解除ボタンを押したときの処理 */
    const handleRemove = (row: MRT_Row<TABLE_ROW>) => {
        // カード登録解除モーダルを表示する
        pageInfo.isCardRemoveModalOpen = true;
        pageInfo.tempData.fcno = row.original.fcno;
        pageInfo.tempData.name = row.original.name;
        updatePageInfo(pageInfo);
    };

    const membersToTableData = async ():Promise<void> => {
        console.log('membersToTableData start')
        const deletedIncluding = pageInfo.checkbox.includes(CHECK_BOX.LOGICAL_DELETE);
        const rows = await memberCardListService.getMembers(deletedIncluding);
        const _data:TABLE_ROW[] = [];
        for(const row of rows){
            const newId = _data.length > 0 ? _data[_data.length - 1].no + 1 : 1;
            const newRow:TABLE_ROW = {
                no: newId,
                fcno: row.fcno,
                name: (row.name)?row.name:'',
                kana: (row.kana)?row.kana:'',
                idm: (row.idm == '')?'':'登録済',
                soft_delete: 0,
            }
            if(row.soft_delete == true){
                newRow.soft_delete = 1;
            }
            _data.push(newRow);
        }
        console.log('_data=',_data);
        pageInfo.tableData = _data;
        updatePageInfo(pageInfo);
    }

    const reload = () => {
        membersToTableData();
    }

    // 確認モーダル（はい）--> カード情報登録解除
    const confirmYes = async () => {
        const fcno = pageInfo.tempData.fcno;
        const result = await memberCardListService.setIdmByFcno(fcno, '');
        if(result){
            Sounds.play(({name:"CARD_OUT"}));
            toast.success("解除成功");
            pageInfo.isCardRemoveModalOpen = false;
            redrawPageInfo(pageInfo);
        }else{
            toast.warning("解除失敗");
        }
    }
    // 確認モーダル（いいえ）
    const confirmNo = () => {
        pageInfo.isCardRemoveModalOpen = false;
        updatePageInfo(pageInfo);
    }
    const pasoriCardListenClear = ()=>{
        console.log('pasoriCardListenClear')
        // カードが離れたときの処理
        PasoriCard.onRelease(async()=>{});
        // カードタッチしたときの処理
        PasoriCard.onTouch(async ()=>{});
    }
    if(pageInfo.isCardRegistModalOpen == false){
        pasoriCardListenClear();
    }

    // redrawPageInfo()が実行されたとき
    // リロードが実行され、メンバー一覧を最新化する仕組み
    useEffect(() => {
        reload();
    },[pageInfo.counter]);

    return (
        <>
        <div ref={content} className="modal_manager" >
            <div className="modal-content">
                <h2><span>利用者カード一覧</span></h2>
                <div style={{marginBottom:10}}>
                    <label>
                        <input
                            type="checkbox"
                            value={CHECK_BOX.LOGICAL_DELETE}
                            checked={pageInfo.checkbox.includes(CHECK_BOX.LOGICAL_DELETE)}
                            onChange={logicalDeleteChanged}
                        />
                        削除されたメンバーを含める
                    </label>
                    <button style={{marginLeft:"20px"}} onClick={reload}>リロード</button>
                    <p style={{color:"red", fontSize:"smaller",marginLeft:"10px"}}>
                        登録中のカードを他者に使うことはできません（削除された「メンバー」へ登録中のカードを含めて）<br/>
                    </p>
                </div>
                <MaterialReactTable
                    columns={columns}
                    data={pageInfo.tableData}
                    muiTableProps={{
                        className: 'member_appTable',
                    }}
                    enableRowActions
                    enableSorting
                    positionActionsColumn="last"
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', gap: '0.2rem' }}>
                            <Tooltip title="登録" arrow placement="top">
                                <IconButton onClick={() => handleRegist(row)}
                                        disabled={row.original.idm != '' || row.original.soft_delete === 1}
                                    >
                                    <AddCardIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="解除" arrow placement="top">
                                <IconButton color="error" onClick={() => handleRemove(row)}
                                        disabled={row.original.idm == ''}
                                    >
                                    <ClearIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                    )}
                />
            </div>
        </div>
        {/* カード登録モーダル */}
        <Modal
            isOpen={pageInfo.isCardRegistModalOpen}
            onRequestClose={() => {
                // モーダルの外をクリックしたときに
                // ここに来る。
            }}
            style={{
                content: {
                    width: "40%",
                    height: "40%",
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'translate(-50%, -50%)',
                    padding: '2rem',
                    zIndex: 1,
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1,
                }
            }}
            >
            <h2 style={{marginBottom:10}}>カード登録</h2>
            <p></p>
            <h3><span>{pageInfo.tempData.name}&nbsp;さん</span></h3>
            <p></p>
            <h5><span style={{color:"red"}}>{pageInfo.textCardRegistModal}</span></h5>
            <div className="modal-button-container" style={{margin:10}}>
                <ModalAlertButton  
                    style={{display:(pageInfo.isCardRegistDone)?"none":"inline-block"}}
                    disabled={pageInfo.isCardRegistDone} 
                    onClick={()=>handleRegistCancel()}>
                    中止
                </ModalAlertButton>
            </div>
        </Modal>
        {/* カード情報登録解除 */}
        <Modal
            isOpen={pageInfo.isCardRemoveModalOpen}
            onRequestClose={() => {
                // モーダルの外をクリックしたときに
                // ここに来る。
            }}
            style={{
                content: {
                    width: "25%",
                    height: "25%",
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'translate(-50%, -50%)',
                    padding: '2rem',
                    zIndex: 1,
                    border: '3px double #0090a0',
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1,
                }
            }}
            >
            <h2 style={{margin:0}}>カード登録を削除しますか？</h2>
            <p></p>
            <div className="modal-button-container" style={{margin:5}}>
                <ModalAlertButton onClick={()=>confirmNo()}
                        >いいえ</ModalAlertButton>
                <ModalButton onClick={()=>confirmYes()}
                        >は&nbsp;&nbsp;い</ModalButton>
            </div>
        </Modal>
        </>
    );
}
