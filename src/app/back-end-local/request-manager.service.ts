import { Injectable } from '@angular/core';
import { IbackEnd, ILoggInData, IResponseData, IGetSessionResponseViewModel } from '../iback-end'

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

  SessionsGetByDate(selectedDate : Date) : Promise<IGetSessionResponseViewModel> | null {

    return null;
  }

}
