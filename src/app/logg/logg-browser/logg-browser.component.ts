import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggOperatorService } from '../logg-operator.service';
import {  Subscription } from 'rxjs';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { IdataObject } from '../../HallBrowser/idata-object';

@Component({
  selector: 'logg-browser',
  templateUrl: './logg-browser.component.html',
  styleUrls: ['./logg-browser.component.css']
})
export class LoggBrowserComponent implements OnInit, OnDestroy {

  loggObjSubs : Subscription;    
  loggObj : Array<IdataObject> = [];
  
  constructor(private loggServise : LoggOperatorService, private apiServise : RequestRouterService ) {
  }

  ngOnInit() {
    this.loggObjSubs = this.loggServise.log$.subscribe(message =>{
      this.loggObj.push(message) 
    });
    this.UpdateLog();
  }

  ngOnDestroy() {
    this.loggObjSubs.unsubscribe()
  }
  
  UpdateLog(){
    this.loggObj = this.loggServise.LoggObj;
  }
  
  ClearLog(){
    this.loggServise.ClearLog();
    this.UpdateLog();
  }

  SaveLog(){
    this.apiServise.RoutSaveLogg();
  }

}
