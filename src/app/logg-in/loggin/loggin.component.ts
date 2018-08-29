import { Component, OnInit } from '@angular/core';
import {RequestRouterService}  from '../../back-end-router/request-router.service'
import { ILoggInData } from '../../iback-end'


class userData implements ILoggInData
{
  login: "380662828954";
  password : "Di4vF67KBw2T";
}

@Component({
  selector: 'app-loggin',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css']
})
export class LogginComponent implements OnInit {
  loginResoult : string = "";

  constructor(private apiServis : RequestRouterService) { }

  ngOnInit() {
  }

  TestLoggIn() {
    
    let logData = new userData();
    logData.password = "Di4vF67KBw2T";
    logData.login    = "380662828954";


    this.loginResoult = this.apiServis.RoutLoggInByPass(logData);


  }

}
