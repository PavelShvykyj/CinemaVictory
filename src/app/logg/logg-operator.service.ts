import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { IdataObject } from '../HallBrowser/idata-object';

@Injectable()
export class LoggOperatorService {

  private _log = new Subject<IdataObject>();
  private _logObject :  Array<IdataObject> = []; 

  log$ : Observable<IdataObject> = this._log.asObservable();
  LOGG_ON: boolean = true;

  SetLoggMessage(loggMessage : IdataObject) {
    if (!this.LOGG_ON) { return }
    this._logObject.push(loggMessage);
    this._log.next(loggMessage);
  }

  public get LoggObj() : Array<IdataObject> {
    return this._logObject;
  }
  
  public set LoggObj(valLogObject: Array<IdataObject>) {
    this._logObject = valLogObject;
  }
  

  ClearLog(){
    if (!this.LOGG_ON) { return }
    this._logObject = [];
    this._log.next({action : 'Logg cleared'});
  }
}
