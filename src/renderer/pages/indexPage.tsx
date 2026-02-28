import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { routePagePath } from '@/renderer/routePath';
import { toast } from 'sonner';
import { authRendererService  } from "@/service/ipcRenderer/authRenderer";
export function IndexPage() {
    const [auth, setAuth] = useState(false);
    const toTopPage = () => {
        const path = routePagePath;
        authRendererService.pageTransition(path.Top);
    }
    const authorize = async () => {
        const authorization = await authRendererService.authorization();
        console.log('authorization=', authorization);
        if( authorization ) {
            // 認証OK
            toast.info('認証OK');
            toTopPage();
            setAuth(true);
        }else{
            // 認証NG
            toast.error('認証障害中');
            setAuth(false);
        }
    }
    useEffect(()=>{
        authorize();
    },[]);

    return (
        <>
        </>
    );
}
