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

@Injectable()
export class RequestManagerService implements IbackEnd {

  private _changeHallState = new Subject<IChairsStatusInSessionInfo>();
  changeHallState$ : Observable<IChairsStatusInSessionInfo> = this._changeHallState.asObservable(); 
  private _subj1CData = new Subject<string>(); 
  promise1CData$ = this._subj1CData.asObservable();

  constructor() { }

  // вызываем в компоненте он клик который генерит 1С (через наш сервис роутер)
  On1CDataIncome(data: string){
    alert('data in servese call next '+data)
    this._subj1CData.next(data);
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


}
