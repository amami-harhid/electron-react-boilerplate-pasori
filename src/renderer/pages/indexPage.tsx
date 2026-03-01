import { useEffect, useState } from "react";
import { Box, Button, styled, IconButton, Tooltip } from '@mui/material';
import { routePagePath } from '@/renderer/routePath';
import { toast } from 'sonner';
import { authRendererService  } from "@/service/ipcRenderer/authRenderer";

const ModalButton = styled(Button)(({ theme })=> ({
    fontSize: "400%",
    padding: "8px 16px",
    border: "groove 5px  #ffAF50",
    borderRadius: "20px",
    cursor: "pointer",
    color: "white",
    background: "#4CAF50",
    "&:hover": {
        background: "#ffffff",
        color: "#f92000",
        transform: "scale(1.2)"
    }
}));

export function IndexPage() {

    const toTopPage = () => {
        const path = routePagePath;
        authRendererService.pageTransition(path.Top);
    }
    const authorize = async () => {
        const authorization = await authRendererService.authorization();
        if (authorization == null){
            // 開発環境時は Renderが複数回走るため authorization()が複数回実行される
            // 連続したauthorization()呼び出しは2回目以降にはnullを返している。
            // authorization()の処理は少し時間がかかるので、1回目の戻りよりは2回目の
            // 戻りが先に戻る。リロードをしたときはauthorization()は常にnullを返す。
        }else if( authorization ) {
            console.log('authorization(1)=', authorization);
            // 認証OK
            toast.info('認証OK');
            toTopPage();
        }
        else{
            console.log('authorization(2)=', authorization);
            // 認証NG
            toast.error('認証障害中');
        }
    }

    return (
        <>
        <div style={{textAlign:'center'}}>
            <ModalButton onClick={authorize}>
                &nbsp;&nbsp;認&nbsp;&nbsp;証&nbsp;&nbsp;
            </ModalButton>
        </div>
        </>
    );
}
