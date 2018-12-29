import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { IdataObject } from '../HallBrowser/idata-object';



@Injectable()
export class LoggOperatorService {

  private _log = new Subject<IdataObject>();
  log$ : Observable<IdataObject> = this._log.asObservable();

  SetLoggMessage(loggMessage : IdataObject) {
    
    let logObject = this.ReadLogFromStorage();
    logObject.push(loggMessage);
    this.LoadLogToStorage(logObject);
    this._log.next(loggMessage);
  }

  LoadLogToStorage(logObject : Array<IdataObject>) {
    //localStorage.setItem('logMessages',JSON.stringify(logObject));    
  }

  ReadLogFromStorage() : Array<IdataObject>  {
    //let logStorage = localStorage.getItem('logMessages');
    let logStorage = [];
    if (typeof logStorage == 'undefined' ||  logStorage == null) {
      return []
    }
    else{
      return logStorage;
      //return JSON.parse(logStorage);
    }
  }

  ClearLog(){
    this.LoadLogToStorage([]);
    this._log.next({action : 'Logg cleared'});
  }
}
