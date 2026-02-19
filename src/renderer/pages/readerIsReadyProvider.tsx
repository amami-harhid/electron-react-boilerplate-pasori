import React, { useState, createContext, useContext, Dispatch, SetStateAction } from "react";

export type ReaderIsReadyState = [boolean, Dispatch<SetStateAction<boolean>>];

export const ReaderIsReady = createContext<ReaderIsReadyState>([false, ()=>{}]);

export const ReaderIsReadyContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {

    const [readerIsReady, setReaderIsReady] = useState(false);

    return (
      <ReaderIsReady.Provider value={[readerIsReady, setReaderIsReady]}>
        {children}
      </ReaderIsReady.Provider>
    );

}
export const useReaderIsReadyContext = () => useContext(ReaderIsReady);