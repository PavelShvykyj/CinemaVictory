import { Component, OnInit, OnDestroy } from '@angular/core';
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

  OnExternal1CValueChange(value){
    // alert(document.getElementById("External1CValue").getAttribute("value"));
    alert('click from 1C');

    this.apiServis.RoutOn1CDataIncome(value);
  }

  Call1c(name,data){
    // не отрабатывает в ИЕ
    // var event = new Event("dblclick",{bubbles: true, cancelable: false});
    //document.addEventListener("help", function(event){alert('event in JS')});

    //let clickEvent = document.createEvent("MouseEvent");
    //clickEvent.initMouseEvent( "help", false,false,window,    0, 0, 0, 0, 0, false, false, false, false, 0, null);
    //document.dispatchEvent(clickEvent);
    Call1C('from JS');
    
    //var event = document.createEvent("MouseEvent");
    //event.initEvent("dblclick", true, false);
    //document.dispatchEvent(event);
    
 
  };

  Alert1CdataIncome(){
    //alert('start click');
   
    this.Call1c(1,1);
    if (this.subs1Cdata) {
      
      this.subs1Cdata.unsubscribe();  
    }

    this.subs1Cdata = this.localService.promise1CData$.subscribe(resoult => {alert(resoult)});
  }

  Generate1CdataIncome(){
    this.OnExternal1CValueChange('some data');
  }


}
