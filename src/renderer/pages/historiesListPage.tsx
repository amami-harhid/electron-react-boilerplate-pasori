import { useState, useEffect} from "react";
import { MaterialReactTable } from 'material-react-table';
import * as DateUtils from '@/utils/dateUtils';
import { historiesPageService } from "@/service/ipcRenderer/historiesListPageRenderer";
import * as PasoriCard from '@/renderer/pages/pasoriCard/pasoriCard';
import { HistoriesMemberRow } from '@/db/histories/historiesRow';
type TABLE_ROW = {
    no:number,
    fcno:string,
    name:string,
    kana:string,
    in:string,
}
type PAGEINFO = {
    date: string,
    tableData: TABLE_ROW[],
}

/** 履歴一覧ページ */
export function HistoriesListPage() {
    const toDay = new Date();
    const toDayStr = DateUtils.dateToSqlite3Date(toDay);
    const [pageInfo, setPageInfo] = useState<PAGEINFO>({date:toDayStr, tableData:[]});

    // Define columns
    const columns = [
        {
            accessorKey: 'no',
            header: 'NO',
            size: 15,
            minSize: 15,
            maxSize: 15,
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
            enableSorting: false,
        },
        {
            accessorKey: 'in',
            header: '状態',
            size: 50,
            minSize: 50,
            maxSize: 50,
            enableSorting: false,
        }
    ];

    /** 履歴をテーブル化 */
    const historiesToTableData = async (date:Date):Promise<TABLE_ROW[]> => {
        const rows:HistoriesMemberRow[] = await historiesPageService.getHistoriesByDate(date);
        const _data:TABLE_ROW[] = [];
        for(const row of rows){
            if(row.date == ''){
                // Historiesテーブルがないとき
                continue;
            }
            const newId = _data.length > 0 ? _data[_data.length - 1].no + 1 : 1;
            const newRow:TABLE_ROW = {
                no: newId,
                fcno: row.fcno,
                name: (row.name)?row.name:'',
                kana: (row.kana)?row.kana:'',
                in: (row.in_room)? '入室':'退室'
            }
            _data.push(newRow);
        }
        return _data;
    }
    /** 日付選択値が変更されたとき */
    const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>)=>{
        const date = event.target.valueAsDate;
        if(date){
            // ここでレンダリングされる（テーブルへのデータ反映）
            pageRender(date);
        }else{
            // ここでレンダリングされる（テーブル初期化）
            pageRender();
        }

    }
    /** ページレンダリング */
    const pageRender = async (date:Date=toDay) => {
        const date_str = DateUtils.dateToSqlite3Date(date);
        const rows = await historiesToTableData(date);
        setPageInfo( {date:date_str, tableData: rows} );
    }

    /** 初期化 */
    const pageInit = () => {
        // ページレンダリングされる
        pageRender();
    }

    useEffect(()=>{
        pageRender();
    },[]);

    PasoriCard.onRelease(async ()=>{});
    PasoriCard.onTouch(async ()=>{});

    return (
        <div className ="mainPanel">
            <div className="modal_histories">
                <div className="modal-content">
                    <label>日付を選択してください:
                        <input type="date" value={pageInfo.date} onChange={handleInputChange}/>
                        &nbsp;<button onClick={pageInit}>初期化</button>
                    </label>
                    <p className="hist_selectedDate">選択された日付: <span>{pageInfo.date}</span></p>
                    <MaterialReactTable
                        columns={columns}
                        data={pageInfo.tableData}
                        muiTableProps={{
                            className: 'hist_appTable',
                        }}
                        enableSorting
                        positionActionsColumn="last"
                    />
                </div>
            </div>
        </div>
    );
}
