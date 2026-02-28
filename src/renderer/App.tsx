import React, {useState, useEffect} from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ReaderIsReadyContextProvider, useReaderIsReadyContext } from './pages/readerIsReadyProvider';
import { Masterhead } from './pages/mastheads/mainMasthead';
import { routePagePath } from './routePath';
import { IndexPage } from './pages/indexPage';
import { TopPage } from './pages/topPage';
import { HistoriesListPage } from './pages/historiesListPage';
import { MemberListPage } from './pages/memberListPage';
import { MemberCardListPage } from './pages/memberCardListPage';
import { MemberTrashedListPage } from './pages/memberTrashedListPage';
import './css/app.css';

const IPCNavigator = () => {
    const navigate = useNavigate();
    useEffect(() => {
        if (window.navigate) {
            window.navigate.onNavigate(async (_path:string) => {
                await navigate(_path, {replace:false});
            });
        }
    },
    // 第二引数は空配列とする。
    // ページ表示後にページごとにuseEffectが実行されてしまい
    // 同じパスへのnavigate(path)がページごとに実行されてしまうことを回避する。
    []);

    return (
        <></>
    )
}
export function App() {
    const [path, ] = useState<typeof routePagePath>(routePagePath);
    return (
        <>
        <ReaderIsReadyContextProvider>
            <div><Masterhead/></div>
            <Router>
                <IPCNavigator/>
                <Routes>
                        <Route path="/" element={<IndexPage />} />
                        <Route path={path.Top} element={<TopPage />} />
                        <Route path={path.HistoriesListPage} element={<HistoriesListPage />} />
                        <Route path={path.MemberListPage} element={<MemberListPage/>} />
                        <Route path={path.MemberCardListPage} element={<MemberCardListPage/>} />
                        <Route path={path.MemberTrashedListPage} element={<MemberTrashedListPage/>} />
                </Routes>
            </Router>
        </ReaderIsReadyContextProvider>
        </>
    );

}
