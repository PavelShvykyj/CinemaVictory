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
 
  userData : ILoggInData;
  refreshLoginTimer : number;

  constructor(private apiServis : RequestRouterService){}

  RefreshToken() {
    console.log(this.userData);
    setTimeout(() => {
      this.apiServis.RoutLoggInByPass(this.userData)
                  .then(resoult => {
                    this.RefreshToken(); // rekursive     
                  })
                  .catch(resoult => {
                    // redirect to login : somthing wrong 
                  })
    }, this.refreshLoginTimer);
  }


  loggOnTrigger(eventData) {
    console.log(eventData)
    this.userData = eventData.userData;
    this.refreshLoginTimer = eventData.timer*60*1000;
    this.RefreshToken()
  }




}
