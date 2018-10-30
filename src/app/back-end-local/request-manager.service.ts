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

  private _subj1CHallInfo = new Subject<string>(); 
  Observ1CHallInfo$ = this._subj1CHallInfo.asObservable();

  private _subj1CSessionsInfo = new Subject<string>(); 
  Observ1CSessionsInfo$ = this._subj1CSessionsInfo.asObservable();

  private _subj1CHallState = new Subject<string>(); 
  Observ1CHallState$ = this._subj1CHallState.asObservable();


  RESPONSE_TIME_OUT = 3000;
  RESPONSE_WAIT_STEP = 500;

  webUserName : string = "380662828954";
  webPassword : string = "Di4vF67KBw2T";
  localeUserName : string = "Atlantyka";

  constructor() { 

  }

  // вызываем в компоненте он клик который генерит 1С (через наш сервис роутер)
  On1CDataIncome(data: string){
    let data1C = JSON.parse(data);
    let point = data1C.point;

    switch (point) {
      case 'PrintTickets' : 
        this._subj1CPrintTickets.next(data);      
      case 'GetGlobalParametrs' :  
        this._subj1CGlobalParams.next(data); 
    }
  }

  getLocalUserName() {
    return this.localeUserName;
  }

  getUserData() : ILoggInData {
    return {userName : this.webUserName , password : this.webPassword }
  }

  LoggInByPass(userData : ILoggInData) : Promise<IResponseData>  {
    return 
  }

  SessionsInfoGetByDate(selectedDate : string) : Promise<ISessionData> | null {
    /// запись snapshot  in 1C buffer
    let timeRemain : number = 0;
    let timeOut : number = this.RESPONSE_TIME_OUT;
    let step : number = this.RESPONSE_WAIT_STEP;
    
    let myPromise : Promise<ISessionData> = new Promise((resolve, reject)=>{
      let stringDataFrom1C : string = '';
      let subs = this.Observ1CSessionsInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C : string = JSON.stringify({point : "SessionsInfoGetByDate",  key : selectedDate})
      Call1C(dataTo1C); 

      while(stringDataFrom1C == "" && timeRemain<=timeOut){        
        timeRemain = timeRemain + step;
        setTimeout(()=>{},timeOut);
      }
      subs.unsubscribe();
      if(stringDataFrom1C != ""){
        resolve(JSON.parse(stringDataFrom1C).data);
      } else{
        reject({
          point : "SessionsInfoGetByDate",
          resoult : false,
          data : {errorText: "time out"}
        });
      }
    });
    return myPromise
  }
  
  GetHallInfo() : Promise<IHallInfo> | null {
    let timeRemain : number = 0;
    let timeOut : number = this.RESPONSE_TIME_OUT;
    let step : number = this.RESPONSE_WAIT_STEP;
    
   
    let myPromise : Promise<IHallInfo> = new Promise((resolve, reject)=>{
      let stringDataFrom1C : string = '';
      let subs = this.Observ1CHallInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C : string = JSON.stringify({point : "GetHallInfo"})
      Call1C(dataTo1C); 

      while(stringDataFrom1C == "" && timeRemain<=timeOut){        
        timeRemain = timeRemain + step;
        setTimeout(()=>{},timeOut);
      }
      subs.unsubscribe();
      if(stringDataFrom1C != ""){
        resolve(JSON.parse(stringDataFrom1C).data);
      } else{
        reject({
          point : "GetHallInfo",
          resoult : false,
          data : {errorText: "time out"}
        });
      }
    });
    return myPromise
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

  SetHallInfo(hallInfo: IHallInfo){
    /// запись snapshot HallInfo in 1C buffer
    let timeRemain : number = 0;
    let timeOut : number = this.RESPONSE_TIME_OUT;
    let step : number = this.RESPONSE_WAIT_STEP;
    
   
    let myPromise : Promise<IDataFrom1C> = new Promise((resolve, reject)=>{
      let stringDataFrom1C : string = '';
      let subs = this.Observ1CHallInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C : string = JSON.stringify({point : "SetHallInfo", data : hallInfo})
      Call1C(dataTo1C); 

      while(stringDataFrom1C == "" && timeRemain<=timeOut){        
        timeRemain = timeRemain + step;
        setTimeout(()=>{},timeOut);
      }
      subs.unsubscribe();
      if(stringDataFrom1C != ""){
        resolve(JSON.parse(stringDataFrom1C));
      } else{
        reject({
          point : "SetHallInfo",
          resoult : false,
          data : {errorText: "time out"}
        });
      }
    });
    return myPromise


  }

  SetSessionsInfoGetByDate(selectedDate : string , sessionData : ISessionData){
    /// запись snapshot  in 1C buffer
    let timeRemain : number = 0;
    let timeOut : number = this.RESPONSE_TIME_OUT;
    let step : number = this.RESPONSE_WAIT_STEP;
    
    let myPromise : Promise<IDataFrom1C> = new Promise((resolve, reject)=>{
      let stringDataFrom1C : string = '';
      let subs = this.Observ1CSessionsInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C : string = JSON.stringify({point : "SetSessionsInfoGetByDate", data : sessionData, key : selectedDate})
      Call1C(dataTo1C); 

      while(stringDataFrom1C == "" && timeRemain<=timeOut){        
        timeRemain = timeRemain + step;
        setTimeout(()=>{},timeOut);
      }
      subs.unsubscribe();
      if(stringDataFrom1C != ""){
        resolve(JSON.parse(stringDataFrom1C));
      } else{
        reject({
          point : "SetSessionsInfoGetByDate",
          resoult : false,
          data : {errorText: "time out"}
        });
      }
    });
    return myPromise
  }

  SetHallState(currentState : ISyncTicketsRequestViewModel , syncTickets : ISyncTicketsResponseViewModelInternal){
    /// из  currentState вычитываем параметры зал сесиия получаем ключ и записываем syncTickets как снепшот 
    /// запись snapshot  in 1C buffer
    let currentKey = {idHall : currentState.idHall, starts : currentState.starts};
    
    let timeRemain : number = 0;
    let timeOut : number = this.RESPONSE_TIME_OUT;
    let step : number = this.RESPONSE_WAIT_STEP;
    let myPromise : Promise<IDataFrom1C> = new Promise((resolve, reject)=>{
      let stringDataFrom1C : string = '';
      let subs = this.Observ1CHallState$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C : string = JSON.stringify({point : "SetHallState", data : syncTickets, key : currentKey})
      Call1C(dataTo1C); 

      while(stringDataFrom1C == "" && timeRemain<=timeOut){        
        timeRemain = timeRemain + step;
        setTimeout(()=>{},timeOut);
      }
      subs.unsubscribe();
      if(stringDataFrom1C != ""){
        resolve(JSON.parse(stringDataFrom1C));
      } else{
        reject({
          point : "SetHallState",
          resoult : false,
          data : {errorText: "time out"}
        });
      }
    });
    return myPromise



  }

  GetHallState(currentState : ISyncTicketsRequestViewModel ) : Promise<IDataFrom1C> {
    /// из  currentState вычитываем параметры зал сесиия получаем ключ и записываем syncTickets как снепшот 
    /// запись snapshot  in 1C buffer
    let currentKey = {idHall : currentState.idHall, starts : currentState.starts};
    
    let timeRemain : number = 0;
    let timeOut : number = this.RESPONSE_TIME_OUT;
    let step : number = this.RESPONSE_WAIT_STEP;
    let myPromise : Promise<IDataFrom1C> = new Promise((resolve, reject)=>{
      let stringDataFrom1C : string = '';
      let subs = this.Observ1CHallState$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C : string = JSON.stringify({point : "GetHallState", key : currentKey})
      Call1C(dataTo1C); 

      while(stringDataFrom1C == "" && timeRemain<=timeOut){        
        timeRemain = timeRemain + step;
        setTimeout(()=>{},timeOut);
      }
      subs.unsubscribe();
      if(stringDataFrom1C != ""){
        resolve(JSON.parse(stringDataFrom1C));
      } else{
        reject({
          point : "GetHallState",
          resoult : false,
          data : {errorText: "time out"}
        });
      }
    });
    return myPromise
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
    while(stringDataFrom1C == "" && timeRenain<=this.RESPONSE_TIME_OUT){
      timeRenain = timeRenain + this.RESPONSE_WAIT_STEP;
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
  
  let myPromise : Promise<boolean> = new Promise((resolve, reject)=>{
      
      let stringDataFrom1C = "";
      let subs = this.promise1CPrintTickets$.subscribe(resuolt =>{
        stringDataFrom1C = resuolt});    
      Call1C(DataTo1C);  
      /// встроить защиту по мамксимум времени т.е. если ждем более сколько то мили секунд перращаем и генерим ошибку
      let timeRenain = 0;
      while(stringDataFrom1C == "" && timeRenain<=this.RESPONSE_TIME_OUT){
        timeRenain = timeRenain + this.RESPONSE_WAIT_STEP;
        setTimeout(()=>{},this.RESPONSE_WAIT_STEP);
      }
        
      subs.unsubscribe();
      resolve(true);


    });
    
    return myPromise;//.then(res => {alert('then in myPromise'); return res});
    
    //return this.promise1CPrintTickets$.toPromise().then(resoult =>{ 
    //  alert('PrintTickets in promise');
    //  return JSON.parse(resoult).resoult });
  }

  //// Пустышки под Сигнал Р аналог
  StartHubbHallConnection(){
  }

  StopHubbHallConnection(){
  }

  OnHubbHallConnection(){
  }

  OfHubbHallConnection(){
  }


}
