import { Injectable } from '@angular/core';
import {  IbackEnd, 
          ILoggInData,
          IChairStatus,
          IChairsStatusInSessionInfo,
          IResponseData,
          IChairStateViewModel,
          IChairStateViewModelInternal,
          ISyncTicketsResponseViewModelInternal,
          ISyncTicketsResponseViewModel,
          ISyncTicketsRequestViewModel,
          IGetSessionResponseViewModel,
          ISessionData,
          IHallInfo } from '../iback-end'


import { IdataObject } from '../HallBrowser/idata-object';
import { HttpHeaders, HttpClient } from '@angular/common/http';
/// <reference types="crypto-js" />
import * as CryptoJS from 'crypto-js';
import * as _ from 'underscore';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class RequestManagerService implements IbackEnd {

  BASE_URL = "https://kino-peremoga.com.ua/api/1.0";
  HALL_ID  = 1;
  PACKAGE_MOVIES_SIZE = 50;
  CRYPTO_KEY = 'xm5POGDda6o1SiZMfuNSvXbV8r0+uyBF7BMdAYh+f5Q=';
  CRYPTO_IV  = 'TweTnUNAAL8VMtvtMNj0Vg==';
  CASH_DESK_ID = 1;


  private _userData : ILoggInData;
  private _refreshLoginTimer : number;
  private _token : string; 
  private _hubHallConnection : HubConnection;
  private _changeHallState = new Subject<IChairsStatusInSessionInfo>();
  changeHallState$ : Observable<IChairsStatusInSessionInfo> = this._changeHallState.asObservable(); 


  constructor(private http : HttpClient) { 
    this._hubHallConnection = new HubConnectionBuilder().withUrl('https://kino-peremoga.com.ua/hallHub').build();   
  }

  ConvertTicketStatusToChairStatus(intStatus : number ) : IChairStatus {
    //let binStatus = intStatus.toString(2);
    // побитовое И + побитовый сдвиг 
    // логика вычислений binStatus = 0000 0000 0000 0000 - 16бит 
    // Біт 16-13:	Ініціатор: 0 - веб, 1-15 - номер каси. 
    // Біт 12-5:	idTicketCategory - катагорія квитка (максімум 255 категорій)
    // Біт 4-3:	завжди 0 (зарезервовано)
    // Біт 2:	блокування: якщо 1 - початий процес продажу або бронювання (місце заблоковано)
    // Біт 1:	операція: 1 - продажа, 0 - бронювання
    let chairStatus : IChairStatus = {
      iniciator : (intStatus & 0b1111000000000000) >> 12,
      idTicketCategory : (intStatus & 0b0000111111110000) >> 4,
      inReserving : (intStatus & 0b0000000000000010) == 2,
      isSoled : (intStatus & 1) == 1,
      isReserved : (intStatus & 1) != 1,
      isFree : false,
      isSelected : false,
    }
    return chairStatus
  }

ConvertChairStatusToTicketStatus(ChairStatus : IChairStatus) : number {
  return 0
}

ConvertSisionDataInternalToSisionData (SessionData : IdataObject ) : ISyncTicketsResponseViewModel {
  let sessionData : ISyncTicketsResponseViewModel = {
    starts : SessionData.starts,
    hallState : []
  };
  SessionData.hallState.forEach(element => {
    let chairState : IChairStateViewModel = {
    c : element.c,
    p : element.p,
    t : element.t,
    s : this.ConvertChairStatusToTicketStatus(element.s)};
    sessionData.hallState.push(chairState);
  });
  return sessionData;
} 

 ConvertSisionDataToSisionDataInternal (SessionData : IdataObject ) : ISyncTicketsResponseViewModelInternal {
    let sessionDataInternal : ISyncTicketsResponseViewModelInternal = {
      starts : SessionData.starts,
      hallState : []
    };
    SessionData.hallState.forEach(element => {
      let chairStateInternal : IChairStateViewModelInternal = {
      c : element.c,
      p : element.p,
      t : element.t,
      s : this.ConvertTicketStatusToChairStatus(element.s)};
      sessionDataInternal.hallState.push(chairStateInternal);
    });
    return sessionDataInternal;
 }


  HubbHallStateParse(encryptedIdSesion : string, SessionData : ISyncTicketsResponseViewModel) {
       
    let encryptedId = encryptedIdSesion.replace(RegExp("~",'g'),"=")
                                       .replace(RegExp("-",'g'),"+")
                                       .replace(RegExp(/\|/ ,'g'),"/");
    let idSesion = this.Decrypt(encryptedId);
    let sessionDataInternal : ISyncTicketsResponseViewModelInternal = this.ConvertSisionDataToSisionDataInternal(SessionData) 
    let hubSessionInfo = {id : parseInt(idSesion) , chairsData : sessionDataInternal};
    this._changeHallState.next(hubSessionInfo);
    
  }

  StartHubbHallConnection(){  
    this._hubHallConnection.start().catch(error => {console.log('start error',error)});   
  }

  StopHubbHallConnection(){
    this._hubHallConnection.stop().catch(error => {console.log(error)});
  }

  OnHubbHallConnection(){
    this._hubHallConnection.on("ReceiveHallState",(idSession, hallstate) =>{
                                                    this.HubbHallStateParse(idSession, hallstate)}
     ) 
  }

  OfHubbHallConnection(){
    this._hubHallConnection.off("ReceiveHallState");
  }

  RefreshToken() {
    setTimeout(() => {
              this.LoggInByPass(this._userData)
                  .then(resoult => {
                    console.log('RefreshToken resoult',resoult)
                    this.RefreshToken(); // rekursive     
                  })
                  .catch(resoult => {
                    console.log('RefreshToken error',resoult)
                    //  somthing wrong что то не так при обновлении токена что будем делать пока не ясно
                    //  токен почищен в  LoggInByPass данные пользователя в свойствах пока не чистим вдруг захотим переденуть
                  })
    }, this._refreshLoginTimer);
  }

  Decrypt(encryptedData) : string {
    let key = CryptoJS.enc.Base64.parse(this.CRYPTO_KEY);
    let iv = CryptoJS.enc.Base64.parse(this.CRYPTO_IV);
    let decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC});
  
    let  decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedData;
  }

  TestCrypt()
  {
    var key = CryptoJS.enc.Utf8.parse('7061737323313233');
    var iv = CryptoJS.enc.Utf8.parse('7061737323313233');
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse("It works"), key,
        {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    console.log('Encrypted :' + encrypted);
    console.log('Key :' + encrypted.key);
    console.log('Salt :' + encrypted.salt);
    console.log('iv :' + encrypted.iv);
    console.log('Decrypted : ' + decrypted);
    console.log('utf8 = ' + decrypted.toString(CryptoJS.enc.Utf8));
  }

  getUserData() : ILoggInData {
    return {userName : "Atlantica", password : "" }
  }

  LoggInByPass(userData : ILoggInData) : Promise<IResponseData>  {

    //this.TestCrypt();
    //sessionStorage.removeItem('token');
    this._token = "";
    let headers = new HttpHeaders().append('Authorization','none').append('Content-Type','text/json')
    let connection = this.BASE_URL+"/account/login";
    
    
     return this.http.post(connection,
                          userData,
                          {headers:headers,
                          observe: 'body',
                          withCredentials:false,
                          reportProgress:true,
                          responseType:'text'})
                      .toPromise()
                      .then(response => { let objResponse = JSON.parse(response);
                            let resoult : IResponseData = {
                            status : '200',
                            statusText : 'Ok',
                            token : objResponse.jwtToken,
                            expired : objResponse.expiryMinutes}
                            this._token = resoult.token;
                            //sessionStorage.setItem('token',resoult.token)
                            this._userData = userData;
                            this._refreshLoginTimer = +objResponse.expiryMinutes*60*10004
                            this.RefreshToken();
                            
                            return resoult;
                    
                       })
                      .catch(error => {
                        let resoult : IResponseData = 
                        {
                        status : error.status,
                        statusText : error.statusText,
                        token : 'badToken',
                        expired : 0
                        }
                        
                        return resoult;

                      }); // конвертируем response в строку. Дешифруем?
  }

  GetMovieByID(idMovie) {
    
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/movies/get/"+idMovie;
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})   

  } 

  GetPakegMoviesById(){
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/movies/getall/0/"+this.PACKAGE_MOVIES_SIZE.toString();  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{return JSON.stringify({movieInfo : JSON.parse(reoult)})});   
  }

  GetCategoryTickets(){
    // /ticketcategories/getall
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/ticketcategories/getall";  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{return JSON.stringify({categoryTicketsInfo : JSON.parse(reoult)})});   


  }

  GetCategorySeats(){
    // /ticketcategories/getall
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/seatcategories/getall";  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{return JSON.stringify({categorySeatsInfo : JSON.parse(reoult)})});   


  }

  GetChairsCateoryInfo(){
    // /ticketcategories/getall
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/hall/get/"+this.HALL_ID;  
    return this.http.get(connection,
                        {headers:headers,
                        observe: 'body',
                        withCredentials:false,
                        reportProgress:true,
                        responseType:'text'})
                     .toPromise()
                     .then(reoult =>{return JSON.stringify({chairsCateoryInfo : JSON.parse(reoult)})});   


  }

  SyncTickets(currentState :  ISyncTicketsRequestViewModel) : Promise<ISyncTicketsResponseViewModelInternal> | null
  { 
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/tickets/sync";  
    let postBody = {
                    idHall: this.HALL_ID,
                    starts: currentState.starts, 
                    blockSeats: [],
                    hallState: []
                   };

    currentState.hallState.forEach(element => {
      postBody.hallState.push(this.ConvertSisionDataInternalToSisionData(element));  
    });
    
    currentState.blockSeats.forEach(element => {
      postBody.blockSeats.push(this.ConvertSisionDataInternalToSisionData(element));  
    });
      
    return this.http.post(connection,
                  postBody,
                  {
                    headers:headers,
                    observe: 'body',
                    withCredentials:false,
                    reportProgress:true,
                    responseType:'json'
                  })
                  .toPromise()
                  .then(response =>
                    {
                      console.log(response);
                      let resoult : ISyncTicketsResponseViewModelInternal  =  this.ConvertSisionDataToSisionDataInternal(response);
                      return resoult;
                    })
                  .catch(error => {return null});
  }

  SessionsGetByDate(selectedDate : string) : Promise<string>  {
    let headers = new HttpHeaders().append('Authorization','Bearer '+this._token).append('Content-Type','text/json')
    let connection = this.BASE_URL+"/sessions/getbydate";
   
    let postBody = {
      idHall: this.HALL_ID,
      starts: selectedDate
      }
      

    return this.http.post(connection,
                  postBody,
                  {headers:headers,
                  observe: 'body',
                  withCredentials:false,
                  reportProgress:true,
                  responseType:'text'})
                  .toPromise()
                  .then(reoult =>{return JSON.stringify({sessionInfo : JSON.parse(reoult)})});
      
  }

  SessionsInfoGetByDate(selectedDate : string)  {
    let promiseCollection : Array<any> = [];
    promiseCollection.push(this.SessionsGetByDate(selectedDate));
    promiseCollection.push(this.GetPakegMoviesById());
 
    return Promise.all(promiseCollection).then(resoult => {
                                          let par_1 = JSON.parse(resoult[0]);
                                          for (let i = 1; i <= resoult.length-1; i++) {
                                                let par = JSON.parse(resoult[i]);
                                                Object.assign(par_1,par);     
                                              }
                                          console.log(par_1);  
                                          return par_1})
                                         .catch(error => {return null})   
                                         
    
    
  }

  GetHallInfo(){
    let promiseCollection : Array<any> = [];
    promiseCollection.push(this.GetCategorySeats());
    promiseCollection.push(this.GetCategoryTickets());
    promiseCollection.push(this.GetChairsCateoryInfo());

    return Promise.all(promiseCollection).then(resoult => {
                                          let par_1 = JSON.parse(resoult[0]);
                                          for (let i = 1; i <= resoult.length-1; i++) {
                                                let par = JSON.parse(resoult[i]);
                                                Object.assign(par_1,par);     
                                              }
                                          console.log(par_1);  
                                          return par_1})
                                         .catch(error => {return null})   


  }

}
