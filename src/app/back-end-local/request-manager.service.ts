import { Injectable } from '@angular/core';
import { IbackEnd, ILoggInData, IResponseData, ISessionData, IHallInfo } from '../iback-end'

@Injectable()
export class RequestManagerService implements IbackEnd {

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

}
