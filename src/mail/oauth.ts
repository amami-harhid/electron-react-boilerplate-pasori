export type TAuth = {
    type: string,
    user: string,
    clientId: string,
    clientSecret: string,
    refreshToken: string,
    accessToken?: string|null,
};
