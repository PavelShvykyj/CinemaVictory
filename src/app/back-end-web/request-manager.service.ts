import { Injectable } from '@angular/core';
import { IbackEnd, ILoggInData } from '../iback-end'
import { HttpHeaders, HttpClient } from '@angular/common/http';
/// <reference types="crypto-js" />
import * as CryptoJS from 'crypto-js';

@Injectable()
export class RequestManagerService implements IbackEnd {

  BASE_URL = "http://dev.kino-peremoga.com.ua/api/1.0";
  
  
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

  LoggInByPass(userData : ILoggInData) : Promise<string>  {

    //this.TestCrypt();

    let headers = new HttpHeaders().append('Authorization','none').append('Content-Type','text/json')
    let connection = this.BASE_URL+"/account/login";
    console.log(userData);
    
     return this.http.post(connection,
                          userData,
                          {headers:headers,
                          withCredentials:false,
                          reportProgress:true,
                          responseType:'text'})
                      .toPromise()
                      .then(res => {console.log(res); return res})
                      .catch(res => {console.log(res); return res}); // конвертируем response в строку. Дешифруем?
  }

}
