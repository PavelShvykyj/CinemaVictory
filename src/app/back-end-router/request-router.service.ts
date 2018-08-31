import { Injectable } from '@angular/core';
import { RequestManagerService } from '../back-end-web/request-manager.service';
import { IbackEnd, ILoggInData, IResponseData } from '../iback-end'

@Injectable()
export class RequestRouterService {
  private backends : Array<IbackEnd> = [];

  constructor(webServise : RequestManagerService) { 
    this.backends.push(webServise);

  }

  SelectBackEnd() : IbackEnd {
    return this.backends[0];
  } 

  RoutLoggInByPass(userdata : ILoggInData) : Promise<IResponseData> {
    let backEnd = this.SelectBackEnd();
    return backEnd.LoggInByPass(userdata);


  }

}
