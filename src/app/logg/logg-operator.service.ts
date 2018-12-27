import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { IdataObject } from '../HallBrowser/idata-object';



@Injectable()
export class LoggOperatorService {

  private _log = new Subject<Array<IdataObject>>();
  log$ : Observable<Array<IdataObject>> = this._log.asObservable();
  private logObject : Array<IdataObject> = [];

  SetLoggMessage(loggMessage : IdataObject) {
    this.logObject = this.ReadLog();
    this.logObject.push(loggMessage);
    this.SaveLog();
    this._log.next(this.logObject);
  }

  SaveLog() {
    localStorage.setItem('logMessages',JSON.stringify(this.logObject));    
  }

  ReadLog() : Array<IdataObject>  {
    let logStorage = localStorage.getItem('logMessages');
    if (typeof logStorage == 'undefined') {
      return []
    }
    else{
      return JSON.parse(logStorage);
    }
  }

}
