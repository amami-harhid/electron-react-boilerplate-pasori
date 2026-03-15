import { useState, useEffect, useRef} from "react";
import { toast } from 'sonner';
import Modal from 'react-modal';
import { MaterialReactTable, type MRT_Row } from 'material-react-table';
import { Box, Button, Checkbox, IconButton, Tooltip, styled } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
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
	checkbox: T_CHECK_BOX[],
}
const ROOM_STATUS = {
	UNKNOWN: 'UNKNOWN',
	NOT_IN: 'NOT_IN',
	IN : 'IN',
	OUT: 'OUT',
} as const
type T_ROOM_STATUS = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS]
type MODAL_PAGE = {
	isUndoModalOpen: boolean,
	title: string,
	fcno: string,
	name: string,
	kana: string,
	/* 現在の入室状況 */
	in_room: boolean,
	/* 現在の入室状況 */
	now_room_status : T_ROOM_STATUS,
	/* 次の入室状況 */
	next_room_status: T_ROOM_STATUS,
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
/** チェックボックス値 */
const CHECK_BOX = {
	NOT_IN_MEMBERS: 'NOT_IN_MEMBER',
} as const 
type T_CHECK_BOX = (typeof CHECK_BOX)[keyof typeof CHECK_BOX]

/** 履歴一覧ページ */
export function HistoriesListPage() {

	const content = useRef(null);
	const element = content.current
	if(element){
		Modal.setAppElement(element);
	}
	const toDay = new Date();
	const toDayStr = DateUtils.dateToSqlite3Date(toDay);
	const [pageInfo, setPageInfo] = useState<PAGEINFO>({date:toDayStr, tableData:[], checkbox:[]});
	const [modalPage, setModalPage] = useState<MODAL_PAGE>(
			{isUndoModalOpen:false, 
				title: '',
				fcno:'', name:'', kana:'', 
				in_room: false, 
				now_room_status: ROOM_STATUS.UNKNOWN, 
				next_room_status: ROOM_STATUS.UNKNOWN,
				date: new Date()});
	const confirmYes = async () => {
		const fcno = modalPage.fcno;
		const now_in_room = modalPage.now_room_status;
		const next_status = modalPage.next_room_status; 
		if(now_in_room == ROOM_STATUS.IN){
			// 現在入室中
			if(next_status == ROOM_STATUS.NOT_IN){
				const rslt = await historiesPageService.clearInRoom(fcno);
				if(rslt){
					toast.success('入室をクリアしました');
				}else{
					toast.error('入室クリアできません');
				}
			}
			else if(next_status == ROOM_STATUS.OUT){
				const rslt = await historiesPageService.changeToOutRoom(fcno);
				if(rslt){
					toast.success('退出にしました');
				}else{
					toast.error('退出できません');
				}
			}
		}else if(now_in_room == ROOM_STATUS.NOT_IN){
			// 現在入室していない
			if(next_status == ROOM_STATUS.IN) {
				// 入室にする
				const rslt = await historiesPageService.changeToInRoom(fcno);
				if(rslt){
					toast.success('入室中にしました');
				}else{
					toast.error('入室中に戻せません');
				}
			}

		}else{
			// 現在退出済
			if(next_status == ROOM_STATUS.IN) {
				// 入室にする（戻す）
				const rslt = await historiesPageService.backToInRoom(fcno);
				if(rslt){
					toast.success('入室中にしました');
				}else{
					toast.error('入室中に戻せません');
				}
			}
		}
		await pageRender();
		const _modalPage = structuredClone(modalPage)
		_modalPage.isUndoModalOpen = false;
		_modalPage.in_room = false;
		_modalPage.now_room_status = ROOM_STATUS.UNKNOWN;
		_modalPage.next_room_status = ROOM_STATUS.UNKNOWN;
		setModalPage(_modalPage);
	}
	const confirmNo = () => {
		const _modalPage = structuredClone(modalPage)
		_modalPage.isUndoModalOpen = false;
		_modalPage.in_room = false;
		_modalPage.now_room_status = ROOM_STATUS.UNKNOWN;
		_modalPage.next_room_status = ROOM_STATUS.UNKNOWN;
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
	const redo = (row: MRT_Row<TABLE_ROW>) => {
		const selectDate = modalPage.date;
		const toDay = new Date();
		if(isNotSameDate(selectDate, toDay) ){
			// 空表示
			return (
				<></>
			);
		}
		const inStr = row.original.in;
		const _modalPage:MODAL_PAGE = {
			isUndoModalOpen: true,
			title: '',
			fcno: row.original.fcno,
			name: row.original.name,
			kana: row.original.kana,
			in_room: false,
			now_room_status: ROOM_STATUS.UNKNOWN,
			next_room_status: ROOM_STATUS.UNKNOWN,
			date: modalPage.date,
		}
		if(inStr.endsWith('-')){
			// 最後がハイフン  入室中⇒退出へ
			const redoIn = () => {
				_modalPage.in_room = true;
				_modalPage.title = '退出にしますか？';
				_modalPage.now_room_status = ROOM_STATUS.IN;
				_modalPage.next_room_status = ROOM_STATUS.OUT;
				setModalPage( _modalPage );
			}			
			return (
				<Tooltip title="退出へ" arrow placement="top">
					<IconButton color="error" onClick={() => redoIn()}>
						<RedoIcon />
					</IconButton>
				</Tooltip>
			);
		}else{
			return (
				<></>
			)
		}
	}
	const undo = (row: MRT_Row<TABLE_ROW>) => {
		const selectDate = modalPage.date;
		const toDay = new Date();
		if(isNotSameDate(selectDate, toDay) ){
			// 空表示
			return (
				<></>
			);
		}
		const inStr = row.original.in;
		const _modalPage:MODAL_PAGE = {
				isUndoModalOpen: true,
				title: '',
				fcno: row.original.fcno,
				name: row.original.name,
				kana: row.original.kana,
				in_room: false,
				now_room_status: ROOM_STATUS.UNKNOWN,
				next_room_status: ROOM_STATUS.UNKNOWN,
				date: modalPage.date,
		}
		if(inStr.length > 0){
			
			if(inStr.startsWith('-') || inStr.startsWith('*')){
				return (
					<></>
				);
			}
			else if(inStr.endsWith('-')){
				// 最後がハイフン  入室中⇒入室無しへ
				const undoIn = () => {
					_modalPage.in_room = true;
					_modalPage.title = '入室無しにしますか？';
					_modalPage.now_room_status = ROOM_STATUS.IN;
					_modalPage.next_room_status = ROOM_STATUS.NOT_IN;
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
				// 退出⇒入室中
				const toIn = () => {
					_modalPage.in_room = false;
					_modalPage.title = '入室中にしますか？';
					_modalPage.now_room_status = ROOM_STATUS.OUT;
					_modalPage.next_room_status = ROOM_STATUS.IN;
					setModalPage( _modalPage );
				}
				return (
					<Tooltip title="入室中へ" arrow placement="top">
						<IconButton onClick={() => toIn()}>
							<UndoIcon />
						</IconButton>
					</Tooltip>
				)
			}

		}else{
			// 入室未
			// 入室未⇒入室中
			const toIn = () => {
					_modalPage.in_room = false;
					_modalPage.title = '入室中にしますか？';
					_modalPage.now_room_status = ROOM_STATUS.NOT_IN;
					_modalPage.next_room_status = ROOM_STATUS.IN;
					setModalPage( _modalPage );
			}
			return (
					<Tooltip title="入室中へ" arrow placement="top">
						<IconButton color="error" onClick={() => toIn()}>
							<RedoIcon />
						</IconButton>
					</Tooltip>
			)
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
		},
	];


	/** 履歴をテーブル化 */
	const historiesToTableData = async (date:Date, notInMember:boolean):Promise<TABLE_ROW[]> => {
		if( notInMember === true ) {
			return await historiesToTableDataNotInMember(date);

		} else {
			return await historiesToTableDataInMember(date);
		}
	}
	const historiesToTableDataInMember = async (date:Date):Promise<TABLE_ROW[]> => {
		const rows:HistoriesMemberRow[] = await historiesPageService.getHistoriesByDate(date, false);
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
	const historiesToTableDataNotInMember = async (date:Date):Promise<TABLE_ROW[]> => {
		const rows:HistoriesMemberRow[] = await historiesPageService.getHistoriesByDate(date, true);
		const _data:TABLE_ROW[] = [];
		for(const row of rows){
			if(row.date_in != ''){
				// Historiesテーブルがあって入室中のとき
				continue;
			}
			const newId = _data.length > 0 ? _data[_data.length - 1].no + 1 : 1;
			const newRow:TABLE_ROW = {
				no: newId,
				fcno: row.fcno,
				name: (row.name)?row.name:'',
				kana: (row.kana)?row.kana:'',
				in: ''
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
	const pageRender = async (date:Date=toDay, checkBox: T_CHECK_BOX[]=[]) => {
		const _modalPage = structuredClone(modalPage);
		_modalPage.date = (date)? date: new Date();
		setModalPage(_modalPage);
		const rows = await historiesToTableData(date, checkBox.includes(CHECK_BOX.NOT_IN_MEMBERS));
		const _pageInfo = structuredClone(pageInfo);
		const date_str = DateUtils.dateToSqlite3Date(date);
		_pageInfo.date = date_str;
		_pageInfo.tableData = rows;
		_pageInfo.checkbox = checkBox;
		setPageInfo( _pageInfo );
	}
	const memberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const checkVal:T_CHECK_BOX = e.target.value as T_CHECK_BOX;
		const checkBox:T_CHECK_BOX[] = []
		if( e.target.checked ) {
			checkBox.push(checkVal);
			const _modalPage = structuredClone(modalPage);
			_modalPage.date = new Date();
			setModalPage(_modalPage);
		}
		const _date = new Date(pageInfo.date);
		pageRender(_date, checkBox);
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
			<div ref={content} className="modal_histories">
				<div className="modal-content">
					<label>日付を選択してください:
						<input type="date" value={pageInfo.date} onChange={handleInputChange}/>
						&nbsp;<button onClick={pageInit}>初期化</button>
					</label>
					<p className="hist_selectedDate">選択された日付: <span>{pageInfo.date}</span></p>
					<div style={{marginBottom:10}}>
					<label>
						<input
							type="checkbox"
							value={CHECK_BOX.NOT_IN_MEMBERS}
							checked={pageInfo.checkbox.includes(CHECK_BOX.NOT_IN_MEMBERS)}
							onChange={memberChange}
						/>
						入室していないメンバーを表示する
					</label>
					</div>
					<MaterialReactTable
						columns={columns}
						data={pageInfo.tableData}
						muiTableProps={{
							className: 'hist_appTable',
						}}
						enableSorting
						positionActionsColumn="last"
						enableRowActions
						displayColumnDefOptions={{
							'mrt-row-actions': {
								header: '操作', // Actionカラムのヘッダー名
							}
						}}
						renderRowActions={({ row }) => (
							<Box sx={{ display: 'flex', gap: '0.2rem' }}>
								{undo(row)}
								{redo(row)}
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
			<h2 style={{margin:0}}>{modalPage.title}</h2>
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
