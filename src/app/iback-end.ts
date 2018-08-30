

export interface ILoggInData {
    userName : string;
    password : string;
}

export interface IbackEnd {
    LoggInByPass(LoggInData : ILoggInData): Promise<string>;
}
