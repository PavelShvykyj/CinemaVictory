

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

export interface IChairCategoryViewModel {
    r : number; 			
    c : number; 			
    idSeatCategory : number;
}

export interface IGetHallResponseViewModel
{
    idHall : number;
	chairs : Array<IChairCategoryViewModel>;
}


export interface ISeatCategoryResponseViewModel 
{
    id: number;
    name: string;
    shortName: string;
    sortorder: number;
}

export interface ITicketCategoryResponseViewModel 
{
    id: number;
    name: string;
    sortorder: number;
}


export interface ITicketCategoryPriceViewModel 
{
	idTicketCategory: number;
	price: number; 
} 

export interface ISessionPriceViewModel
{
	idSeatCategory: number;
    tickets: Array<ITicketCategoryPriceViewModel>;
}

export interface IGetMovieResponseViewModel
{ 
    id: number;
    title: string;
    format: string;
    premier: string;
    comments: string;
    genre: string;
    artists: string;
    production: string;
    duration: string;
    producer: string;
    urlTrailer: string;
    description: string;
    ticketCount: number;
    sessionCount: number;
}


export interface IGetSessionResponseViewModel {
    id: number ; 
	isVisible: boolean ;
	idHall: number ; 
	starts: Date ;
	idMovie: number ;
    prices: Array<ISessionPriceViewModel>
}

export interface ISessionData {
    sessionInfo : Array<IGetSessionResponseViewModel>;
    movieInfo : Array<IGetMovieResponseViewModel>;
}

export interface IHallInfo {
    categorySeatsInfo :  Array<ISeatCategoryResponseViewModel>;
    categoryTicketsInfo :  Array<ITicketCategoryResponseViewModel>;
    chairsCateoryInfo :  Array<IGetHallResponseViewModel>;
}

export interface IbackEnd {
    LoggInByPass(LoggInData : ILoggInData): Promise<IResponseData>;
    getUserData() : ILoggInData;
    SessionsInfoGetByDate(selectedDate : string) : Promise<ISessionData> | null;
    GetHallInfo() : Promise<IHallInfo> | null;

}
