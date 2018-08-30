import { Component, OnInit } from '@angular/core';
import {RequestRouterService}  from '../../back-end-router/request-router.service'
import { ILoggInData } from '../../iback-end'


class UserData implements ILoggInData
{
 
  userName: string;
  password : string;
  
  constructor(login: string,  password : string)   {
    this.userName = login;
    this.password = password;     
  }  
  
}

@Component({
  selector: 'app-loggin',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css']
})
export class LogginComponent implements OnInit {
  

  constructor(private apiServis : RequestRouterService) { }

  ngOnInit() {
  }

  TestLoggIn() {
    
    this.apiServis.RoutLoggInByPass(new UserData("380662828954","Di4vF67KBw2T"))
        .then(
          resoult => {console.log(resoult)}
        );
  }

}
