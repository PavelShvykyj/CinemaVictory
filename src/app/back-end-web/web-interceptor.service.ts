import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout } from 'rxjs/operators';


@Injectable()
export class WebInterceptorService implements HttpInterceptor {

  DEFOULT_TIMEOUT : number = 10000;
 
  
  intercept(req : HttpRequest<any>, next : HttpHandler) : Observable<HttpEvent<any>> {
    // handle передает далее полученный (пойманный) запрос по цепочке перехватчиков возвращает Observable<HttpEvent<any>> 
    // pipe - метод объекта Observable возвращает функцию которая выполняет над потоком переданные в параметрах функции
    // мы используем оператор timeout который вызывает ошибку если не пришло ни одного сообщения в течении переденного вермени
    
    let reqTimout = req.headers.get('timeout');
    let resoultTimeout : number =  this.DEFOULT_TIMEOUT;
    if(reqTimout){
      resoultTimeout  =  parseInt(reqTimout);
     } 
     console.log('in interceptor',resoultTimeout);
     return next.handle(req).pipe(timeout(resoultTimeout));
  }
  

}
