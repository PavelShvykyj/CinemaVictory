

export interface ILoggInData {
    userName : string;
    password : string;
}

export interface IResponseData {
    status : string;
    statusText : string;
    token : string;
    expired : number;
}


export interface IbackEnd {
    LoggInByPass(LoggInData : ILoggInData): Promise<IResponseData>;
    getUserData() : ILoggInData;
}
