import { Injectable } from '@angular/core';
import { IbackEnd,
         IDataFrom1C,
         ISyncTicketsRequestViewModel,
         ISyncTicketsResponseViewModelInternal,
         ILoggInData,
         IChairsStatusInSessionInfo,
         ICancelTicketRequestViewModel,
         IResponseData,
         ISessionData,
         IHallInfo } from '../iback-end'

import { Observable } from 'rxjs/Observable';
import { IdataObject } from '../HallBrowser/idata-object';
import { Subject } from 'rxjs/Subject';
import { resolve } from 'url';



@Injectable()
export class RequestManagerService implements IbackEnd {

  private _changeHallState = new Subject<IChairsStatusInSessionInfo>();
  changeHallState$ : Observable<IChairsStatusInSessionInfo> = this._changeHallState.asObservable(); 
  
  private _subj1CData = new Subject<string>(); 
  promise1CData$ = this._subj1CData.asObservable();

  private _subj1CPrintTickets = new Subject<string>(); 
  promise1CPrintTickets$ = this._subj1CPrintTickets.asObservable();

  private _subj1CGlobalParams = new Subject<string>(); 
  Observ1CGlobalParams$ = this._subj1CGlobalParams.asObservable();


  RESPONSE_TIME_OUT = 3000;
  RESPONSE_WAIT_STEP = 500;

  constructor() { 

  }

  // вызываем в компоненте он клик который генерит 1С (через наш сервис роутер)
  On1CDataIncome(data: string){
    //alert('data in servese '+data)
    //this._subj1CPrintTickets.next(data);
    
    let data1C = JSON.parse(data);
    let point = data1C.point;

    switch (point) {
      case 'PrintTickets' : 
        this._subj1CPrintTickets.next(data);      
      case 'GetGlobalParametrs' :  
        this._subj1CGlobalParams.next(data);      
    }


    //if(data1C.point == 'PrintTickets'){
    //alert('data in servese '+data)
    //this._subj1CPrintTickets.next(data);
    //}
    //else{
    //  alert(data1C.command) 
    //this._subj1CData.next(data)}
  }

 
  getLocalUserName() {
    return "Atlantyka";
  }

  getUserData() : ILoggInData {
    return {userName : "380662828954", password : "Di4vF67KBw2T" }
  }

  LoggInByPass(userData : ILoggInData) : Promise<IResponseData>  {
    return 
  }

  SessionsInfoGetByDate(selectedDate : string) : Promise<ISessionData> | null  {

    return null;
  }
  
  GetHallInfo() : Promise<IHallInfo> | null {
    return null;
  }

  StartHubbHallConnection(){
    
  }

  StopHubbHallConnection(){
    
  }

  OnHubbHallConnection(){
    

  }

  OfHubbHallConnection(){
    
  }

  SyncTickets(currentState :  ISyncTicketsRequestViewModel) : Promise<ISyncTicketsResponseViewModelInternal> | null
  { 
    /// из  currentState вычитываем параметры зал сесиия получаем ключ 
    /// по ключу получаем снепшот зала
    /// дополняем снепшот зала данными из масивов халлстате и блокситс

    /// возвращаем заполненный снепшот
    /// вызываем this.SetHallState(currentState : ISyncTicketsRequestViewModel ,resoult : ISyncTicketsResponseViewModelInternal)
    /// что бы запомнить текущий снепшот
    /// если работают 2 кассы придумать блокировку и возврат ошибок
    /// если снепшот успешно записан поставить команду в буфер передачи на сервер - это отдельная таблица должна быть
    
    return null
  }

  SetHallInfo(resoult: IHallInfo){
    /// запись snapshot HallInfo in 1C buffer
  }

  SetSessionsInfoGetByDate(selectedDate : string , resoult : ISessionData){
    /// запись snapshot  in 1C buffer
  }

  SetHallState(currentState : ISyncTicketsRequestViewModel ,resoult : ISyncTicketsResponseViewModelInternal){
    /// из  currentState вычитываем параметры зал сесиия получаем ключ и записываем resoult как снепшот 
    /// запись snapshot  in 1C buffer
  }

  CancelTickets(TicketsToCancel : ICancelTicketRequestViewModel) : Promise<number>{
    return null
  }

GetGlobalParametrs() : Promise<IDataFrom1C> {
  let myPromise : Promise<IDataFrom1C> = new Promise((resolve, reject)=>{
    let stringDataFrom1C : string = '';
    let subs = this.Observ1CGlobalParams$.subscribe(resoult => {
      stringDataFrom1C = resoult;
    })
    let dataTo1C : string = JSON.stringify({point : "GetGlobalParametrs"})
    Call1C(dataTo1C); 
    let timeRenain = 0;
    while(stringDataFrom1C == "" || timeRenain<=this.RESPONSE_TIME_OUT){
      setTimeout(()=>{},this.RESPONSE_WAIT_STEP);
    }
    subs.unsubscribe();
    if(stringDataFrom1C != ""){
      resolve(JSON.parse(stringDataFrom1C));
    } else{
      reject({
        point : "GetGlobalParametrs",
        resoult : false,
        data : {errorText: "time out"}
      });
    }
  });
  return myPromise
}

PrintTicets(DataTo1C : string) :Promise<boolean>  {
  alert('DataTo1C '+DataTo1C);
  let myPromise : Promise<boolean> = new Promise((resolve, reject)=>{
      alert('DataTo1C in promise funk'+DataTo1C);
      let DataFrom1C = "";
      let subs = this.promise1CPrintTickets$.subscribe(resuolt =>{
      DataFrom1C = resuolt});    
      Call1C(DataTo1C);  
      /// встроить защиту по мамксимум времени т.е. если ждем более сколько то мили секунд перращаем и генерим ошибку
      while(DataFrom1C == ""){
        setTimeout(()=>{},1000);
      }
      alert('DataFrom1C '+DataFrom1C);
      subs.unsubscribe();
      resolve(true);


    });
    
    return myPromise.then(res => {alert('then in myPromise'); return res});
    
    //return this.promise1CPrintTickets$.toPromise().then(resoult =>{ 
    //  alert('PrintTickets in promise');
    //  return JSON.parse(resoult).resoult });
  }

}
