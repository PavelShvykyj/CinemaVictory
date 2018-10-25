import { Injectable } from '@angular/core';
import { IbackEnd,
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

  constructor() { 

  }

  // вызываем в компоненте он клик который генерит 1С (через наш сервис роутер)
  On1CDataIncome(data: string){
    alert('data in servese '+data)
    this._subj1CPrintTickets.next(data);
    
    //let data1C = JSON.parse(data);
    
    //if(data1C.command == 'PrintTickets'){
    //  alert('call next ') 
    //  this._subj1CPrintTickets.next(data1C.Resoult);
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

PrintTicets(DataTo1C : string) :Promise<boolean>  {
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
    let myPromise : Promise<boolean> = new Promise((resolve)=>function(resolve){resolve(true)});
    
    return myPromise.then(res => {alert('then in myPromise'); return res});
    
    //return this.promise1CPrintTickets$.toPromise().then(resoult =>{ 
    //  alert('PrintTickets in promise');
    //  return JSON.parse(resoult).resoult });
  }

}
