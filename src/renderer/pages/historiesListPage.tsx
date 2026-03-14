import { useState, useEffect} from "react";
import { toast } from 'sonner';
import Modal from 'react-modal';
import { MaterialReactTable, type MRT_Row } from 'material-react-table';
import { Box, Button, IconButton, Tooltip, styled } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import * as DateUtils from '@/utils/dateUtils';
import { historiesPageService } from "@/service/ipcRenderer/historiesListPageRenderer";
import * as PasoriCard from '@/renderer/pages/pasoriCard/pasoriCard';
import { HistoriesMemberRow } from '@/db/historiesRow';
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
type MODAL_PAGE = {
	isUndoModalOpen: boolean,
	fcno: string,
	name: string,
	kana: string,
	in_room: boolean,
	date: Date,
}
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

/** 履歴一覧ページ */
export function HistoriesListPage() {
	const toDay = new Date();
	const toDayStr = DateUtils.dateToSqlite3Date(toDay);
	const [pageInfo, setPageInfo] = useState<PAGEINFO>({date:toDayStr, tableData:[]});
	const [modalPage, setModalPage] = useState<MODAL_PAGE>({isUndoModalOpen:false, fcno:'', name:'', kana:'', in_room: false, date: new Date()});
	const confirmYes = async (in_room:boolean) => {
		const fcno = modalPage.fcno;
		const date = modalPage.date;
		if(in_room){
			const rslt = await historiesPageService.changeToClearInRoom(fcno, date);
			if(rslt){
				toast.success('入室をクリアしました');
			}else{
				toast.error('入室クリアできません');
			}
		}else{
			const rslt = await historiesPageService.changeToInRoom(fcno, date);
			if(rslt){
				toast.success('入室中にしました');
			}else{
				toast.error('入室中に戻せません');
			}
		}
		await pageRender();
		const _modalPage = structuredClone(modalPage)
		_modalPage.isUndoModalOpen = false;
		_modalPage.in_room = false;
		setModalPage(_modalPage);
	}
	const confirmNo = () => {
		const _modalPage = structuredClone(modalPage)
		_modalPage.isUndoModalOpen = false;
		_modalPage.in_room = false;
		setModalPage(_modalPage);
	}
	const isNotSameDate = (date1:Date, date2:Date) => {
		const _date01 = `${date1.getFullYear()}${date1.getMonth()}${date1.getDate()}`;
		const _date02 = `${date2.getFullYear()}${date2.getMonth()}${date2.getDate()}`;
		if(_date01 == _date02 ) {
			return false;
		}else{
			return true;
		}
	}
	const undo = (row: MRT_Row<TABLE_ROW>) => {
		const selectDate = modalPage.date;
		console.log(selectDate);
		const toDay = new Date();
		if(isNotSameDate(selectDate, toDay) ){
			// 空表示
			return (
				<></>
			);
		}
		const inStr = row.original.in;
		if(inStr.length > 0){
			const _modalPage:MODAL_PAGE = {
				isUndoModalOpen: true,
				fcno: row.original.fcno,
				name: row.original.name,
				kana: row.original.kana,
				in_room: false,
				date: modalPage.date,
			}
			console.log(_modalPage, inStr);
			console.log("inStr.startsWith('-')=", inStr.startsWith('-'))
			if(inStr.startsWith('-') || inStr.startsWith('*')){
				return (
					<></>
				);
			}
			else if(inStr.endsWith('-')){
				// 最後がハイフン ⇒ 入室中
				const undoIn = () => {
					_modalPage.in_room = true;
					setModalPage( _modalPage );
				}
				return (
					<Tooltip title="入室無へ" arrow placement="top">
						<IconButton onClick={() => undoIn()}>
							<UndoIcon />
						</IconButton>
					</Tooltip>
				)
			}else{
				// 退出済
				// 最後がハイフン ⇒ 入室中へ
				const toIn = () => {
					_modalPage.in_room = false;
					setModalPage( _modalPage );
				}
				return (
					<Tooltip title="入室中へ" arrow placement="top">
						<IconButton color="error" onClick={() => toIn()}>
							<UndoIcon />
						</IconButton>
					</Tooltip>
				)
			}
		}
	}



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
			const _dateIn = (row.date_in)?((row.date_in.length<5)?'': row.date_in?.substring(0,5)): '';
			const dateIn = (_dateIn == '00:00')? '**:**': _dateIn;
			const _dateOut = (row.date_out)?((row.date_out.length<5)?'': row.date_out?.substring(0,5)): '';
			const dateOut = (_dateOut == '23:59')? '**:**': _dateOut;
			const newRow:TABLE_ROW = {
				no: newId,
				fcno: row.fcno,
				name: (row.name)?row.name:'',
				kana: (row.kana)?row.kana:'',
				in: (row.in_room)? `${dateIn} -`: (dateIn=='')? '' : `${dateIn} - ${dateOut}`
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
		const _modalPage = structuredClone(modalPage);
		_modalPage.date = (date)? date: new Date();
		setModalPage(_modalPage);
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
		<>
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
						enableRowActions
						enableSorting
						positionActionsColumn="last"
						renderRowActions={({ row }) => (
							<Box sx={{ display: 'flex', gap: '0.2rem' }}>
								{undo(row)}
							</Box>
						)}
					/>
				</div>
			</div>
		</div>
		{/* UNDOモーダル */}
		<Modal
			isOpen={modalPage.isUndoModalOpen}
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
			<h2 style={{margin:0}}>{(modalPage.in_room)?'入室未に戻しますか？':'入室中に戻しますか？'}</h2>
			<p></p>
			<div className="modal-button-container" style={{margin:5}}>
				<ModalAlertButton onClick={()=>confirmNo()}
						>いいえ</ModalAlertButton>
				<ModalButton onClick={()=>confirmYes(modalPage.in_room)}
						>は&nbsp;&nbsp;い</ModalButton>
			</div>
		</Modal>
		</>
		
	);
}
