import { Component, OnInit, OnDestroy } from '@angular/core';
import { HallComponent } from './HallBrowser/hall/hall.component';
import { LogginComponent } from './logg-in/loggin/loggin.component'
import {RequestRouterService}  from './back-end-router/request-router.service'
import { ILoggInData } from './iback-end'
import { Observable } from 'rxjs/Observable';



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
  
  

  // зависимость нужна обязательно для оповещений
  constructor(private apiServis : RequestRouterService){}

  ngOnInit() {
    this.subsBackEndName = this.apiServis.changeEmittedBackEndName$.subscribe(text => { this.currentBackEndName = text});
    this.apiServis.changeEmittedLoginName$.subscribe(text => { this.currentUserName = text});
  }

  ngOnDestroy() {
    this.subsBackEndName.unsubscribe();
    this.subsUserName.unsubscribe();
  }
}
