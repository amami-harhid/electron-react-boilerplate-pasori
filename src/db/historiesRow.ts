export type HistoriesRow = {
    id?: number;
    fcno: string;
    date: string;
    date_in: string;
    date_out: string;
    in_room: boolean; 
    date_time?: string;
}

export type HistoriesMemberRow = {
    id?: number;
    fcno: string;
    date: string;
    date_in?: string;
    date_out?: string;
    in_room: boolean;
    name?: string;
    kana?: string;
    mail?: string;
    date_time?: string;
}

export type HistoriesMemberIdmRow = {
    id?: number;
    idm: string;
    fcno: string;
    date: string;
    date_in?: string;
    date_out?: string;
    in_room: boolean;
    name: string;
    kana: string;
    mail: string;
    date_time?: string;
}