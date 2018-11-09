import { Component, OnInit, ViewChild,  OnDestroy } from '@angular/core';
import { MessagesComponent } from './HallBrowser/messages/messages.component';
//import { LogginComponent } from './logg-in/loggin/loggin.component'
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
  
  @ViewChild(MessagesComponent) 
  messagesComponent : MessagesComponent

  // зависимость нужна обязательно для оповещений
  constructor(private apiServis : RequestRouterService, private localService : RequestManagerService){}

  ngOnInit() {
    this.subsBackEndName = this.apiServis.changeEmittedBackEndName$.subscribe(text => {
      this.apiServis.currentBackEndName = text;  
       if(this.currentBackEndName != text && this.currentBackEndName == "1C"){
          this.apiServis.RoutGetBufferSize().then(size => {
            if(size!=0){
              // поменяли бек с 1С веб возможно нужно отправить очередь
              this.ShowTemporaryMessage("Нужно передать Данные на сайт ( всего "+size+ " )...",0,2);
            }
          }).catch(err=>{ this.ShowTemporaryMessage("нет связи с 1С...",5000,2); });
        }
        this.currentBackEndName = text;
      });
    this.apiServis.changeEmittedLoginName$.subscribe(text => { this.currentUserName = text});
  }

  ngOnDestroy() {
    this.subsBackEndName.unsubscribe();
    this.subsUserName.unsubscribe();
  }

  ShowTemporaryMessage(message : string, duration : number, imp : number){
    this.messagesComponent.AddMessage(message,imp);
    if (duration != 0)
    {
      setTimeout(() => {
        this.messagesComponent.ClearMessages(); 
      }, duration);
    }
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

 

   
 
  


}
