import { Component } from '@angular/core';
import { HallComponent } from './HallBrowser/hall/hall.component';
import { LogginComponent } from './logg-in/loggin/loggin.component'
import {RequestRouterService}  from './back-end-router/request-router.service'
import { ILoggInData } from './iback-end'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // зависимость нужна обязательно для оповещений
  constructor(private apiServis : RequestRouterService){}

}
