import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, tap, catchError } from 'rxjs/operators';
import { LoggOperatorService } from '../logg/logg-operator.service';
import { IdataObject } from '../HallBrowser/idata-object';
import { IloggObject } from '../ilogg';
import { LoggMessageTypes } from '../global_enums'


@Injectable()
export class WebInterceptorService implements HttpInterceptor {

  DEFOULT_TIMEOUT: number = 10000;
  

  constructor(private logOperator: LoggOperatorService) { }

  private SetLoggMessage(req) {
    let loggMessage: IloggObject;
    if (req instanceof HttpResponse) {
      loggMessage = {
        message_date: new Date().toLocaleDateString()+"_"+new Date().toLocaleTimeString(),
        message_name: req.url,
        message_type: LoggMessageTypes.Response,
        message_parametr: [{ name: req.status.toString() }]
      }
    } else if (req instanceof HttpRequest) {
      loggMessage = {
        message_date: new Date().toLocaleDateString()+"_"+new Date().toLocaleTimeString(),
        message_name: req.url,
        message_type: LoggMessageTypes.Request,
        message_parametr: [{ name: req.method, body: req.body }]
      } 
    } else {
      loggMessage = {
        message_date: new Date().toLocaleDateString()+"_"+new Date().toLocaleTimeString(),
        message_name: "101",
        message_type: LoggMessageTypes.Response,
        message_parametr: [{ name: "time out" }]
    }
  }
  this.logOperator.SetLoggMessage(loggMessage);
}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // handle передает далее полученный (пойманный) запрос по цепочке перехватчиков возвращает Observable<HttpEvent<any>> 
    // pipe - метод объекта Observable возвращает функцию которая выполняет над потоком переданные в параметрах функции
    // мы используем оператор timeout который вызывает ошибку если не пришло ни одного сообщения в течении переденного вермени

      

    if(req instanceof HttpRequest) {
      this.SetLoggMessage(req) 
    }      
    

    let reqTimout = req.headers.get('timeout');
    let resoultTimeout: number = this.DEFOULT_TIMEOUT;
    if (reqTimout) {
      resoultTimeout = parseInt(reqTimout);
    }
    
    return next.handle(req).pipe(
      tap(req => { 
        if (req instanceof HttpResponse){
          this.SetLoggMessage(req) 
        }
      }),
      timeout(resoultTimeout),
      catchError(err => {
        this.SetLoggMessage(err); 
        return Observable.throw(err);
      }));
  }
}
