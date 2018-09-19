import { Injectable } from '@angular/core';
import { IbackEnd, ILoggInData, IResponseData, ISessionData, IHallInfo } from '../iback-end'
import { Observable } from 'rxjs/Observable';
import { IdataObject } from '../HallBrowser/idata-object';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class RequestManagerService implements IbackEnd {

  private _changeHallState = new Subject<IdataObject>();
  changeHallState$ : Observable<IdataObject> = this._changeHallState.asObservable(); 
   

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


}
