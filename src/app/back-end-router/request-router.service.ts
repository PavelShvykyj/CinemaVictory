import { Injectable } from '@angular/core';
import { RequestManagerService as webManagerServise } from '../back-end-web/request-manager.service';
import { RequestManagerService as localManagerServise } from '../back-end-local/request-manager.service';

import { IbackEnd,
         ILoggInData,
         IResponseData,
         IChairsStatusInSessionInfo,
         ISessionData,
         ISyncTicketsRequestViewModel,
         ISyncTicketsResponseViewModelInternal,
         IHallInfo } from '../iback-end'

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/merge';
import { IdataObject } from '../HallBrowser/idata-object';

@Injectable()
export class RequestRouterService {
  private backends : Array<IbackEnd> = [];
  private emitChangeLoginName = new Subject<string>();
  private emitChangeBackEndName = new Subject<string>();
  changeHallState$ : Observable<IChairsStatusInSessionInfo>; 
  changeEmittedLoginName$ = this.emitChangeLoginName.asObservable();
  changeEmittedBackEndName$ = this.emitChangeBackEndName.asObservable();

 
  constructor(private webServise : webManagerServise, private localServise : localManagerServise) { 
    this.backends.push(this.webServise);
    this.backends.push(this.localServise);
    this.changeHallState$ = Observable.merge(this.webServise.changeHallState$ ,this.localServise.changeHallState$); 
    
  }

  emitLoginName(change: string) {
    this.emitChangeLoginName.next(change);
  }

  emitBackEndName(change: string) {
    this.emitChangeBackEndName.next(change);
  }

  SelectBackEnd() : IbackEnd {
    return this.backends[0];
  } 

  RoutLoggInByPass(userdata : ILoggInData) : Promise<IResponseData> {
   
    // логинимся по данным веб т.е.
    // получаем данные логг и заходим с ними авоматом для 1С логин всегда успешен ибо мы уже зашли
    // в случае когда заходим от 1С порядок зеркальный 
    // c1userdata = this.c1Servise.GetData(userdata);
    // this.c1Servise.LoggInByPass(c1userdata).then()
    // сообщаем успех 1С  
    
    this.emitBackEndName("1C");
    let LocalUserData : ILoggInData = this.webServise.getUserData();
    this.emitLoginName(LocalUserData.userName);

    return this.webServise.LoggInByPass(userdata)
                          .then(resoult => { 
                            if (resoult.status == "200" ){
                              this.emitBackEndName("WEB");
                              this.emitLoginName(userdata.userName);
                            }
                            return resoult});
  }


  RoutLoggInByLocal(userdata : ILoggInData) : Promise<IResponseData> {
     
    // 1C логин всегда успех подумать как тут получить правильное имя юзера
    this.emitBackEndName("1C");
    this.emitLoginName(this.localServise.getLocalUserName());

    let WebUserData : ILoggInData = this.localServise.getUserData();

    return this.webServise.LoggInByPass(WebUserData)
                          .then(resoult => { 
                            if (resoult.status == "200" ){
                              this.emitBackEndName("WEB");
                              this.emitLoginName(WebUserData.userName);
                            }
                            return resoult});
  }


  RoutSessionsGetByDate(selectedDate : string) : Promise<ISessionData> | null {

    return this.webServise.SessionsInfoGetByDate(selectedDate);
  }

  RoutGetHallInfo() : Promise<IHallInfo> | null  {
    return this.webServise.GetHallInfo();
  }

  RoutStartHubbHallConnection(){
    this.webServise.StartHubbHallConnection();
    this.localServise.StartHubbHallConnection();
  }

  RoutStopHubbHallConnection(){
    this.webServise.StopHubbHallConnection();
    this.localServise.StopHubbHallConnection();
  }

  RoutOnHubbHallConnection(){
    this.webServise.OnHubbHallConnection();
    this.localServise.OnHubbHallConnection();
  }

  RoutOfHubbHallConnection(){
    this.webServise.OfHubbHallConnection();
    this.localServise.OfHubbHallConnection();
  }

  RoutDecrypt(encryptedData) : string {
    return this.webServise.Decrypt(encryptedData);
  }

  RoutSyncTickets(currentState :  ISyncTicketsRequestViewModel) : Promise<ISyncTicketsResponseViewModelInternal> | null {
    return this.webServise.SyncTickets(currentState);
  }

}
