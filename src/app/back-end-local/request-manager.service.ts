import { Injectable } from '@angular/core';
import { IbackEnd,
         ISyncTicketsRequestViewModel,
         ISyncTicketsResponseViewModelInternal,
         ILoggInData,
         IChairsStatusInSessionInfo,
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
   

  constructor() { }

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
    return null
  }

}
