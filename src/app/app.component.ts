import { Component, OnInit, AfterViewInit , OnDestroy } from '@angular/core';
import { HallComponent } from './HallBrowser/hall/hall.component';
import { LogginComponent } from './logg-in/loggin/loggin.component'
import {RequestRouterService}  from './back-end-router/request-router.service'
import {RequestManagerService }  from './back-end-local/request-manager.service'
import { ILoggInData } from './iback-end'
import { Observable } from 'rxjs/Observable';
import 'jquery';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUserName : string = "Aninimus";
  currentBackEndName : string = "Nothing";
  subsBackEndName;
  subsUserName;
  subs1Cdata;
  
  

  // зависимость нужна обязательно для оповещений
  constructor(private apiServis : RequestRouterService, private localService : RequestManagerService){}

  ngOnInit() {
    this.subsBackEndName = this.apiServis.changeEmittedBackEndName$.subscribe(text => { this.currentBackEndName = text});
    this.apiServis.changeEmittedLoginName$.subscribe(text => { this.currentUserName = text});
  }

  ngOnDestroy() {
    this.subsBackEndName.unsubscribe();
    this.subsUserName.unsubscribe();
  }

  

  // Вызывается извне 1Сом через поиск соответствующего DOM инпута 
  // и генерации клика на нем данные передаются через value елемента
  // старт запроса из JS
  OnExternal1CValueChange(el){
    this.apiServis.RoutOn1CDataIncome(el.value);
  }
 
  // Вызывается извне 1Сом через поиск соответствующего DOM инпута 
  // и генерации клика на нем данные передаются через value елемента
  // старт запроса из 1C
  OnInit1CDataIncome(el){
    this.apiServis.RoutInit1CDataIncome(el.value);
  }

  // удалить после тестов
  Call1c(name,data){
    Call1C('from JS');
  };

   // удалить после тестов
  Alert1CdataIncome(){
    //alert('start click');
   
    Call1C('from JS');
    if (this.subs1Cdata) {
      this.subs1Cdata.unsubscribe();  
    }
    this.subs1Cdata = this.localService.promise1CData$.subscribe(resoult => {alert(resoult)});
  }
 
  // удалить после тестов
  Generate1CdataIncome(){
    this.OnExternal1CValueChange('some data');
  }


}
