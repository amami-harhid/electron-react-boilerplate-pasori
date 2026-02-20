import { useRef, useEffect, useState } from "react";
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import { MaterialReactTable, type MRT_Row, type MRT_RowData } from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { styled } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/PersonAdd';
import { toast } from 'sonner';

import { memberListService } from "@/service/ipcRenderer/memberListRenderer";
import * as PasoriCard from '@/renderer/pages/pasoriCard/pasoriCard';
import { MemberRow } from "@/db/memberRow";

const Display = {
    block: 'block',
    none: 'none',
    inline_block: 'inline-block',
}
const RegistName = {
    update: '更新',
    add: '追加',
}
type TABLE_ROW = {
    no:number,
    fcno:string,
    name:string,
    kana:string,
    mail:string,
}
const TypeRegist = {
    None: '',
    Regist: 'regist',
    Replace: 'replace',
    Delete: 'delete',
} as const;
type TTypeRegist =  (typeof TypeRegist)[keyof typeof TypeRegist];
type PAGEINFO = {
    view: {guidance:string},
    tableDisplay: string,
    tableData: TABLE_ROW[],
    registButtonDisplay: string,
    replaceButtonDisplay: string,
    deleteButtonDisplay: string,
    registButtonName: string,
    modalPageInfo: TABLE_ROW,
    fcnoReadOnly : boolean,
    etcReadOnly : boolean,
    isModalOpen : boolean,
    isConfirmOpen: boolean,
    typeRegist: TTypeRegist,
    tempData: TABLE_ROW,
    counter: number,
}
const initPageInfo: PAGEINFO = {
    view: {guidance: ''},
    tableDisplay: Display.block,
    tableData: [],
    registButtonDisplay: Display.none,
    replaceButtonDisplay: Display.none,
    deleteButtonDisplay: Display.none,
    registButtonName: RegistName.update,
    fcnoReadOnly: false,
    etcReadOnly: false,
    modalPageInfo: { no: 0, fcno: '', name: '', kana: '', mail: ''},
    isModalOpen: false,
    isConfirmOpen: false,
    typeRegist: '',
    tempData: {no: 0, fcno:'', name:'', kana:'', mail: ''},
    counter: 0,
};
type FormValues = {
  fcno: string,
  name: string,
  kana: string,
  mail: string,
};

const StyledNoButton = styled(Button)(({ theme })=> ({
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
const StyledYesButton = styled(Button)(({ theme })=> ({
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

export function MemberListPage () {
    const [pageInfo, setPageInfo] = useState<PAGEINFO>(initPageInfo);
    const updatePageInfo = ( info: PAGEINFO ) => {
        const _clone = structuredClone(info);
        setPageInfo(_clone);
    }
    const redrawPageInfo = ( info: PAGEINFO ) => {
        info.counter += 1;
        updatePageInfo(info);
    }
    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>();
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
            accessorKey: 'mail',
            header: 'Mail',
            size: 150,
            minSize: 150,
            maxSize: 200,
            enableSorting: false,
        }
    ];
    const handleCancel = () =>{
        pageInfo.tableDisplay = Display.block;
        pageInfo.isModalOpen = false;
        pageInfo.registButtonDisplay = Display.none;
        pageInfo.deleteButtonDisplay = Display.none;
        pageInfo.fcnoReadOnly = false;
        pageInfo.etcReadOnly = false;
        updatePageInfo(pageInfo);
    }
    const handleEdit = (row: MRT_Row<TABLE_ROW> ) => {
        pageInfo.isModalOpen = true;
        pageInfo.modalPageInfo.no = row.original.no;
        pageInfo.modalPageInfo.fcno = row.original.fcno;
        pageInfo.modalPageInfo.name = row.original.name;
        pageInfo.modalPageInfo.kana = row.original.kana;
        pageInfo.modalPageInfo.mail = row.original.mail;
        reset(pageInfo.modalPageInfo);
        pageInfo.tableDisplay = Display.none;
        pageInfo.registButtonDisplay = Display.none;
        pageInfo.replaceButtonDisplay = Display.inline_block;
        pageInfo.deleteButtonDisplay = Display.none;
        pageInfo.fcnoReadOnly = true;
        pageInfo.etcReadOnly = false;
        updatePageInfo(pageInfo);
    };
    const handleDelete = (row: MRT_Row<TABLE_ROW>) => {
        pageInfo.isModalOpen = true;
        pageInfo.modalPageInfo.no = row.original.no;
        pageInfo.modalPageInfo.fcno = row.original.fcno;
        pageInfo.modalPageInfo.name = row.original.name;
        pageInfo.modalPageInfo.kana = row.original.kana;
        pageInfo.modalPageInfo.mail = row.original.mail;
        reset(pageInfo.modalPageInfo);
        pageInfo.tableDisplay = Display.none;
        pageInfo.registButtonDisplay = Display.none;
        pageInfo.replaceButtonDisplay = Display.none;
        pageInfo.deleteButtonDisplay = Display.inline_block;
        pageInfo.fcnoReadOnly = true;
        pageInfo.etcReadOnly = true;
        updatePageInfo(pageInfo);
    };
    const handleAdd = () => {
        pageInfo.isModalOpen = true;
        pageInfo.modalPageInfo.no = 0;
        pageInfo.modalPageInfo.fcno = '';
        pageInfo.modalPageInfo.name = '';
        pageInfo.modalPageInfo.kana = '';
        pageInfo.modalPageInfo.mail = '';
        reset(pageInfo.modalPageInfo);
        pageInfo.tableDisplay = Display.none;
        pageInfo.registButtonDisplay = Display.inline_block;
        pageInfo.replaceButtonDisplay = Display.none;
        pageInfo.deleteButtonDisplay = Display.none;
        pageInfo.fcnoReadOnly = false;
        pageInfo.etcReadOnly = false;
        updatePageInfo(pageInfo);
    };
    const formSubmitRegist = async (data:FormValues) => {
        // DBレコードを追加する
        console.log('formSubmitRegist')
        const fcno = data.fcno;
        const row = await memberListService.getMemberIdmByFcno(fcno);
        if(row == undefined) {
            pageInfo.tempData.fcno = fcno;
            pageInfo.tempData.name = data.name;
            pageInfo.tempData.kana = data.kana;
            pageInfo.tempData.mail = data.mail;
            pageInfo.isConfirmOpen = true;
            pageInfo.typeRegist = TypeRegist.Regist;
            updatePageInfo(pageInfo);
            //reload();
        }else{
            // fcnoが重複
            setError('fcno', {type:'manual', message:'重複しています'});
        }

    }
    const formSubmitReplace = async (data:FormValues) => {
        console.log('formSubmitReplace')
        // DBレコード上書きをする
        const fcno = data.fcno;
        const row = await memberListService.getMemberByFcno(fcno);
        if(row) {
            pageInfo.tempData.fcno = fcno;
            pageInfo.tempData.name = data.name;
            pageInfo.tempData.kana = data.kana;
            pageInfo.tempData.mail = data.mail;
            pageInfo.isConfirmOpen = true;
            pageInfo.typeRegist = TypeRegist.Replace;
            updatePageInfo(pageInfo);
        }
        //reload();

    }
    const formSubmitDelete = async (data:FormValues) => {
        console.log('formSubmitDelete')
        const fcno = data.fcno;
        const row = await memberListService.getMemberByFcno(fcno);
        if(row) {
            pageInfo.tempData.fcno = fcno;
            pageInfo.isConfirmOpen = true;
            pageInfo.typeRegist = TypeRegist.Delete;
            updatePageInfo(pageInfo);
        }
    }

    const membersToTableData = async ():Promise<void> => {
        const rows = await memberListService.getMembers();
        const _data:TABLE_ROW[] = [];
        for(const row of rows){
            const newId = _data.length > 0 ? _data[_data.length - 1].no + 1 : 1;
            const newRow:TABLE_ROW = {
                no: newId,
                fcno: row.fcno,
                name: (row.name)?row.name:'',
                kana: (row.kana)?row.kana:'',
                mail: (row.mail)?row.mail:'',
            }
            _data.push(newRow);
        }
        pageInfo.tableData = _data;
        updatePageInfo(pageInfo);
    }

    const reload = () => {
        membersToTableData();
    }

    // 確認モーダル（はい）
    const confirmYes = async () => {
        pageInfo.isConfirmOpen = false;
        const data = pageInfo.tempData;
        if(pageInfo.typeRegist==TypeRegist.Regist){
            await memberRegist(data);
            toast.success("追加しました");
            redrawPageInfo(pageInfo);

        }else if(pageInfo.typeRegist == TypeRegist.Replace){
            await memberReplace(data);
            toast.success("更新しました");
            redrawPageInfo(pageInfo);

        }else if(pageInfo.typeRegist == TypeRegist.Delete){
            pageInfo.isModalOpen = false;
            pageInfo.tableDisplay = Display.block;
            await memberDelete(data);
            toast.warning("削除しました");
            redrawPageInfo(pageInfo);

        }else{
            redrawPageInfo(pageInfo);
            return;
        }
    }
    // 確認モーダル（いいえ）
    const confirmNo = () => {
        pageInfo.isConfirmOpen = false;
        updatePageInfo(pageInfo);
    }
    // 追加する
    const memberRegist = async (data: TABLE_ROW) => {
        const newRow:MemberRow = {
            fcno: data.fcno,
            name: data.name,
            kana: data.kana,
            mail: data.mail,
        };
        await memberListService.addMember(newRow);
        pageInfo.isModalOpen = false;
        pageInfo.tableDisplay = Display.block;
    }
    // 上書きする
    const memberReplace = async (data: TABLE_ROW) => {
        const newRow:MemberRow = {
            fcno: data.fcno,
            name: data.name,
            kana: data.kana,
            mail: data.mail,
        };
        await memberListService.updateMemberByFcno(data.fcno, newRow);
        pageInfo.isModalOpen = false;
        pageInfo.tableDisplay = Display.block;
    }
    // 削除する
    const memberDelete = async (data: TABLE_ROW) => {
        await memberListService.deleteMemberByFcno(data.fcno);

    }

    // カードが離れたときの処理
    PasoriCard.onRelease(async()=>{});
    // カードタッチしたときの処理
    PasoriCard.onTouch(async ()=>{});

    // redrawPageInfo()が実行されたとき
    // リロードが実行され、メンバー一覧を最新化する仕組み
    useEffect(() => {
        reload();
    },[pageInfo.counter]);

    return (
        <>
        <div ref={content} className="modal_manager" >
            <div className="modal-content" style={{display: pageInfo.tableDisplay}}>
                <h2><span>利用者一覧</span></h2>
                <div><button onClick={reload}>リロード</button></div>
                <h4>{pageInfo.view.guidance}</h4>
                <MaterialReactTable
                    columns={columns}
                    data={pageInfo.tableData}
                    muiTableProps={{
                        className: 'member_appTable',
                    }}
                    enableRowActions
                    enableSorting
                    createDisplayMode="modal"
                    onCreatingRowSave={async ({ values, table }) => {
                        // 何もしない。
                    }}
                    renderTopToolbarCustomActions={({ table }) => (
                        <Box>
                            <Tooltip title="追加">
                                <IconButton onClick={() => handleAdd()}>
                                    <AddIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    positionActionsColumn="last"
                    renderRowActions={({ row }) => (
                        <>
                        <Box sx={{ display: 'flex', gap: '0.2rem' }}>
                            <Tooltip title="編集" arrow placement="top">
                                <IconButton onClick={() => handleEdit(row)}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="削除" arrow placement="top">
                                <IconButton color="error" onClick={() => handleDelete(row)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        </>
                    )}
                />
            </div>
        </div>
        <Modal
            isOpen={pageInfo.isModalOpen}
            onRequestClose={() => {
                // モーダルの外をクリックしたときに
                // ここに来る。
            }}
            style={{
                content: {
                    width: "50%",
                    height: "70%",
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
            <h2 style={{marginBottom:10}}>入力パネル</h2>
            <form>
                <div>
                    <table className='member_appTable'>
                        <tbody>
                        <tr>
                            <td>FCNO</td>
                            <td><input type="text"
                                pattern="[0-9]*"
                                {
                                    ...register("fcno", {
                                        required: 'FCNOは必須です',
                                        pattern: { value: /^\d+$/, message: '半角数字にしてください' }
                                    })
                                }
                                size={4}
                                readOnly={pageInfo.fcnoReadOnly}/>
                                {errors.fcno && <p style={{margin:'0', fontSize:'smaller', color:'red'}}>{errors.fcno.message}</p>}
                            </td>
                        </tr>
                        <tr>
                            <td>名前</td>
                            <td><input type="text"
                                {
                                    ...register("name",{
                                        required: '名前は必須です'
                                    })
                                }
                                size={50}
                                readOnly={pageInfo.etcReadOnly}/>
                                {errors.name && <p style={{margin:'0', fontSize:'smaller', color:'red'}}>{errors.name.message}</p>}
                            </td>
                        </tr>
                        <tr>
                            <td>カナ</td>
                            <td><input type="text"
                                {
                                    ...register("kana",{
                                        required: 'カナは必須です'
                                    })
                                }
                                size={50}
                                readOnly={pageInfo.etcReadOnly}/>
                                {errors.kana && <p style={{margin:'0', fontSize:'smaller', color:'red'}}>{errors.kana.message}</p>}
                            </td>
                        </tr>
                        <tr>
                            <td>MAIL</td>
                            <td><input type="text"
                                {
                                    ...register("mail",{
                                        pattern: { value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, message: '正しいメールアドレスを入力してください' }
                                    })
                                }
                                size={50}
                                readOnly={pageInfo.etcReadOnly}/>
                                {errors.mail && <p style={{margin:'0', fontSize:'smaller',color:'red'}}>{errors.mail.message}</p>}
                                </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </form>
            <div className="modal-button-container" style={{margin:20}}>
                <StyledNoButton onClick={handleCancel}>中止</StyledNoButton>
                <StyledYesButton onClick={handleSubmit(formSubmitRegist)}
                    style={{display:pageInfo.registButtonDisplay}}
                    >追加</StyledYesButton>
                <StyledYesButton onClick={handleSubmit(formSubmitReplace)}
                    style={{display:pageInfo.replaceButtonDisplay}}
                    >更新</StyledYesButton>
                <StyledYesButton onClick={handleSubmit(formSubmitDelete)}
                    style={{display:pageInfo.deleteButtonDisplay}}
                    >削除</StyledYesButton>
            </div>
        </Modal>
        <Modal
            isOpen={pageInfo.isConfirmOpen}
            onRequestClose={() => {
                // モーダルの外をクリックしたときに
                // ここに来る。
            }}
            style={{
                content: {
                    width: "35%",
                    height: "20%",
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
            <h2 style={{margin:0}}>確認</h2>
            <p></p>
            <div className="modal-button-container" style={{margin:5}}>
                <StyledNoButton onClick={confirmNo}
                        >いいえ</StyledNoButton>
                <StyledYesButton onClick={confirmYes}
                        >は&nbsp;&nbsp;い</StyledYesButton>
            </div>
        </Modal>
        </>
    );
}
