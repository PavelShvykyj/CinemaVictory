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
import * as _ from 'underscore';
import { IdataObject } from '../HallBrowser/idata-object';

@Injectable()
export class RequestRouterService {
  private backends : Array<IbackEnd> = [];
  private emitChangeLoginName = new Subject<string>();
  private emitChangeBackEndName = new Subject<string>();
  changeHallState$ : Observable<IChairsStatusInSessionInfo>; 
  changeEmittedLoginName$ = this.emitChangeLoginName.asObservable();
  changeEmittedBackEndName$ = this.emitChangeBackEndName.asObservable();
  internalErrors = [400, 401, 403, 404, 406];

 
  constructor(private webServise : webManagerServise, private localServise : localManagerServise) { 
    this.backends.push(this.webServise);
    this.backends.push(this.localServise);
    this.changeHallState$ = Observable.merge(this.webServise.changeHallState$ ,this.localServise.changeHallState$); 
    
  }

  IsInternalError(status: number) {
    let foundError = _.find(this.internalErrors, elemrnt=>{return status==elemrnt})
    if (foundError){
      return true
    } 
    else{
      return false  
    } 
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
    
    
    let LocalUserData : ILoggInData = this.webServise.getUserData();
    this.emitBackEndName("1C"); 
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

    return this.webServise.SessionsInfoGetByDate(selectedDate)
                          .then(resoult=>{
                            this.localServise.SetSessionsInfoGetByDate(selectedDate,resoult);
                            return resoult;
                          })
                          .catch(error=>{
                            if (this.IsInternalError(error.status)){
                              throw error
                            }  
                            else{
                              this.emitBackEndName("1C");
                              this.emitLoginName(this.localServise.getLocalUserName());
                              return this.localServise.SessionsInfoGetByDate(selectedDate);
                            }
                          });   
  }

  RoutGetHallInfo() : Promise<IHallInfo> | null  {
    return this.webServise.GetHallInfo().then(resoult => {
                                          /// web вернул актуальный статус загоним его 1С
                                          /// теоритически может возникнуть ситуация что вернулась связь 
                                          /// и со старым токеном прошел запрос при отображенном состоянии
                                          /// emitBackEndName("1C") Не меняем его - пусть перелогинятся так надежнее
                                          this.localServise.SetHallInfo(resoult);
                                          return resoult;
                                        
                                        })
                                        .catch(error =>{
                                          console.log('error in rour servise',error)
                                          if (this.IsInternalError(error.status)){
                                            ///// сайт на связи вернул ошибку т.е. это реальная ошибка
                                            ////  тут придумать лог/сообщение ахтунг
                                            throw error
                                          }
                                          else{
                                            ////// неизвестно что думаем сайт не на связи ставим в буфер 1С
                                            /// отображаем что  работаем с 1С
                                            this.emitBackEndName("1C");
                                            this.emitLoginName(this.localServise.getLocalUserName());
                                            return this.localServise.GetHallInfo();
                                          }
                                        });
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
    return this.webServise.SyncTickets(currentState)
                          .then(resoult => {
                            console.log('ok in rout servise',resoult)
                            return resoult;
                          })
                          .catch(error => {
                            console.log('error in rout servise',error)
                            if (this.IsInternalError(error.status)){
                              ///// сайт на связи вернул ошибку т.е. это реальная ошибка
                              ////  тут придумать лог/сообщение ахтунг
                              throw error
                            }
                            else{
                              this.emitBackEndName("1C");
                              this.emitLoginName(this.localServise.getLocalUserName());
                              return this.localServise.SyncTickets(currentState)
                            }
                          });
  } 

  RoutConvertTicketStatusToChairStatus(status){
    return this.webServise.ConvertTicketStatusToChairStatus(status)

  }

}
