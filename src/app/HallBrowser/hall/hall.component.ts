import { Component, OnInit,OnDestroy , ViewChildren, QueryList } from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { IdataObject } from '../idata-object'
import * as _ from 'underscore';
import { ISessionData, IHallInfo } from '../../iback-end';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'hall',
  templateUrl: './hall.component.html',
  styleUrls: ['./hall.component.css'],
})
export class HallComponent implements OnInit, OnDestroy {
  
  @ViewChildren(HallChairComponent)
  private chairList : QueryList<HallChairComponent>;
  mouseStatusCoverByRow : IdataObject = 
  {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
    13: false,
    14: false,
    15: false,
    16: false,
    17: false,
    18: false,
    19: false,
  };

  sessionData : IdataObject =  
  {
    'currentDate' : null, 
    'currentMovie' : null,
    'currentSession' : null
  };

  hallInfo : IHallInfo; 
  hallState$ : Observable<IdataObject>;
  hallStateSubscription;
  hallStateLastSnapshot = [];

  constructor(private apiServis : RequestRouterService) { 
    this.hallState$ = apiServis.changeHallState$;
    this.hallStateSubscription = this.hallState$.subscribe(resoult => 
      {
        console.log('snapsot ',this.hallStateLastSnapshot);
        console.log('difference ',_.difference(resoult.sessionData.hallState,this.hallStateLastSnapshot));
        this.hallStateLastSnapshot = resoult.sessionData.hallState; 

    
    
    
      });
  
  }

  ngOnInit() {
    this.UpdateHallInfo();
    this.apiServis.RoutStartHubbHallConnection();
    this.apiServis.RoutOnHubbHallConnection();
 
  
  }
 
  ngOnDestroy() {
    this.hallStateSubscription.unsubscribe();
    this.apiServis.RoutOfHubbHallConnection();
    this.apiServis.RoutStopHubbHallConnection();
     
  }

  OnmouseoverHallColumn(row) {
    
    this.mouseStatusCoverByRow[row] = true
  }

  OnmouseoutHallColumn(row){
    
    this.mouseStatusCoverByRow[row] = false
  }


  MarkSelectedChairAsSold() {
    let foundChair = this.chairList.find(function(chair) {
      return chair.status.isSelected == true;
    });

    
    while (foundChair != undefined)
    {
      foundChair.status.isSelected = false;
      foundChair.status.isSoled = true;
      foundChair = this.chairList.find(function(chair) {
        return chair.status.isSelected == true;
      });
    }
  }

  FunkBtnTest() {
    this.MarkSelectedChairAsSold();
  }
  
  FunkBtnUnderscoreTest() {
    //let s : number = 16;
    //console.log(s.toString(2));
    let s = "123~~";
    let s1 = s.replace(new RegExp("~",'g'),"");
    console.log(s1);


  }

  UpdateHallInfo()  {
     this.apiServis.RoutGetHallInfo().then(resoult => {this.hallInfo = resoult})
                                     .catch(error => (this.hallInfo = null)) 
  }

  OnSessionDataChange(sessionData) {
    
    if (!this.hallInfo) 
      {
        this.UpdateHallInfo();
      } 
    this.sessionData = sessionData;   
  }

}
