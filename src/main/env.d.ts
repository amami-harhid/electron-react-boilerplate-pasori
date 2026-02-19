declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly API_KEY: string;
        readonly PORT?: string; // オプショナルな変数
    }
}