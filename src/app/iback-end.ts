

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
    movies: Array<IGetMovieResponseViewModel> 
}

export interface IbackEnd {
    LoggInByPass(LoggInData : ILoggInData): Promise<IResponseData>;
    getUserData() : ILoggInData;
    SessionsGetByDate(selectedDate : Date) : Promise<IGetSessionResponseViewModel> | null;
    

}
