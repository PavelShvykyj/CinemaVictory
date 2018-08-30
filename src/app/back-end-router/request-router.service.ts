import { Injectable } from '@angular/core';
import { RequestManagerService } from '../back-end-web/request-manager.service';
import { IbackEnd, ILoggInData } from '../iback-end'

@Injectable()
export class RequestRouterService {
  private backends : Array<IbackEnd> = [];

  constructor(webServise : RequestManagerService) { 
    this.backends.push(webServise);

  }

  SelectBackEnd() : IbackEnd {
    return this.backends[0];
  } 

  RoutLoggInByPass(userdata : ILoggInData) : Promise<string> {
    let backEnd = this.SelectBackEnd();
    return backEnd.LoggInByPass(userdata);


  }

}
