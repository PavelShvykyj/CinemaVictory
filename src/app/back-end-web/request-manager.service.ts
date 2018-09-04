import { Injectable } from '@angular/core';
import { IbackEnd, ILoggInData, IResponseData } from '../iback-end'
import { HttpHeaders, HttpClient } from '@angular/common/http';
/// <reference types="crypto-js" />
import * as CryptoJS from 'crypto-js';

@Injectable()
export class RequestManagerService implements IbackEnd {

  BASE_URL = "https://kino-peremoga.com.ua/api/1.0";
  
  private _userData : ILoggInData;
  private _refreshLoginTimer : number;

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


  constructor(private http : HttpClient) { 
    

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

  LoggInByPass(userData : ILoggInData) : Promise<IResponseData>  {

    //this.TestCrypt();
    sessionStorage.removeItem('token');
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
                            sessionStorage.setItem('token',resoult.token)
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

}
