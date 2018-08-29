export interface ILoggInData {
    login : string;
    password : string;
}

export interface IbackEnd {
    LoggInByPass(LoggInData : ILoggInData): string;
}
