export interface ILogger {
    info: CallableFunction;
    debug: CallableFunction;
    warn: CallableFunction;
    error: CallableFunction;
}