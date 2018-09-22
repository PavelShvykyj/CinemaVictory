
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

export interface IChairsStatusInSessionInfo {
    id : string,
    chairsData : ISyncTicketsResponseViewModelInternal
}


export interface IHallInfo {
    categorySeatsInfo :  Array<ISeatCategoryResponseViewModel>;
    categoryTicketsInfo :  Array<ITicketCategoryResponseViewModel>;
    chairsCateoryInfo :  Array<IGetHallResponseViewModel>;
}

export interface ISyncTicketsResponseViewModel
{
    starts: string,//"yyyy-MM-dd HH:mm:ss",
    hallState:  Array<IChairStateViewModel>
}


export interface IChairViewModel
{ 
    r: number, 	// номер ряду
    c: number 	// номер крісла
}

export interface IChairStatus
{
    isFree       : boolean,            
    inReserving  : boolean,            
    isReserved   : boolean,            
    isSoled      : boolean,            
    isSelected   : boolean,            
    iniciator    : number,            
    idTicketCategory : number            
}

export interface IChairStateViewModelInternal
{
    c: IChairViewModel,	// ряд, крісло
    p: number,			// ціна
    s: IChairStatus,	// статус
    t: string			// зашифрований код квитка
}

export interface IChairStateViewModel
{
    c: IChairViewModel,	// ряд, крісло
    p: number,			// ціна
    s: number,			// статус
    t: string			// зашифрований код квитка
}

export interface ISyncTicketsRequestViewModel
{
    idHall: number,
    starts: string, //"yyyy-MM-dd HH:mm:ss",		
    blockSeats: Array<IChairStateViewModelInternal>,
    hallState: Array<IChairStateViewModelInternal>
}

export interface ISyncTicketsResponseViewModelInternal
{
    starts: string,//"yyyy-MM-dd HH:mm:ss",
    hallState:  Array<IChairStateViewModelInternal>
}


export interface IbackEnd {
    LoggInByPass(LoggInData : ILoggInData): Promise<IResponseData>;
    getUserData() : ILoggInData;
    SessionsInfoGetByDate(selectedDate : string) : Promise<ISessionData> | null;
    GetHallInfo() : Promise<IHallInfo> | null;
    SyncTickets(currentState :  ISyncTicketsRequestViewModel) : Promise<ISyncTicketsResponseViewModelInternal> | null;

}
