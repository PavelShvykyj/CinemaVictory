import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoggOperatorService } from '../logg-operator.service';
import { from } from 'rxjs/observable/from';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'logg-browser',
  templateUrl: './logg-browser.component.html',
  styleUrls: ['./logg-browser.component.css']
})
export class LoggBrowserComponent implements OnInit, OnDestroy {

  loggObjSubs : Subscription;    
  constructor(private loggServise : LoggOperatorService ) {
      
   }

  ngOnInit() {
    this.loggObjSubs = this.loggServise.log$.subscribe();
  }

  ngOnDestroy() {
    this.loggObjSubs.unsubscribe()
  }
}
