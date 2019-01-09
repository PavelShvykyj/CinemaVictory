import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, tap, catchError } from 'rxjs/operators';
import { LoggOperatorService } from '../logg/logg-operator.service';
import { IdataObject } from '../HallBrowser/idata-object';


@Injectable()
export class WebInterceptorService implements HttpInterceptor {

  DEFOULT_TIMEOUT: number = 10000;
  

  constructor(private logOperator: LoggOperatorService) { }

  SetLoggMessage(logMessage: IdataObject) {
      this.logOperator.SetLoggMessage(logMessage);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // handle передает далее полученный (пойманный) запрос по цепочке перехватчиков возвращает Observable<HttpEvent<any>> 
    // pipe - метод объекта Observable возвращает функцию которая выполняет над потоком переданные в параметрах функции
    // мы используем оператор timeout который вызывает ошибку если не пришло ни одного сообщения в течении переденного вермени

    let reqTimout = req.headers.get('timeout');
    let resoultTimeout: number = this.DEFOULT_TIMEOUT;
    if (reqTimout) {
      resoultTimeout = parseInt(reqTimout);
    }
    
    return next.handle(req).pipe(
      tap(req => { 
        this.SetLoggMessage(req) 
      }),
      timeout(resoultTimeout),
      catchError(err => {
        this.SetLoggMessage(req);
        return Observable.throw(err);
      }));
  }
}
