export class AuthError extends Error {

    private _code: number = 0;

    get code() {
        return this._code;
    }
    set code(_code:number) {
        this._code = _code;
    }
}