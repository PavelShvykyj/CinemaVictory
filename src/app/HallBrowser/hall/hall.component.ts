import { Component, OnInit,OnDestroy , ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { IdataObject } from '../idata-object'
import * as _ from 'underscore';
import { ISessionData,
         ISyncTicketsRequestViewModel,
         IChairsStatusInSessionInfo,
         IChairStateViewModelInternal,
         ICurrentSessionInfo,
         ISyncTicketsResponseViewModelInternal,
         IHallInfo, 
         IGetHallResponseViewModel,
         ITicketCategoryPriceViewModel} from '../../iback-end';
import { Observable } from 'rxjs/Observable';
//import printJS from "print-js";
//import 'jquery'; 
//import '../../../../node_modules/jQuery-Print/dist/jQuery.print.min.js';

	


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

  sessionData : ICurrentSessionInfo =  
  {
    currentDate : null, 
    currentMovie : null,
    currentSession : null
  };

  hallInfo : IHallInfo; 
  hallState$ : Observable<IChairsStatusInSessionInfo>;
  hallStateSubscription;
  hallStateLastSnapshot = [];
  chairsInWork : Array<IChairStateViewModelInternal> = [];
  

  constructor(private apiServis : RequestRouterService, private changeDetector : ChangeDetectorRef) { 
    this.hallState$ = apiServis.changeHallState$;
    this.hallStateSubscription = this.hallState$.subscribe(resoult => 
      {
        if (resoult.id == this.sessionData.currentSession.id)
          {
            this.UpdateHallState(resoult.chairsData);
          }
      }); 

      
  }

  ngOnInit() {
    this.UpdateHallInfo();
    this.apiServis.RoutStartHubbHallConnection();
    this.apiServis.RoutOnHubbHallConnection();
    this.chairsInWork = [];
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
      return chair.chairStateInternal.s.isSelected == true;
    });

    
    while (foundChair != undefined)
    {
      foundChair.chairStateInternal.s.isSelected = false;
      foundChair.chairStateInternal.s.isSoled = true;
      foundChair = this.chairList.find(function(chair) {
        return chair.chairStateInternal.s.isSelected == true;
      });
    }
  }

  FunkBtnTest() {
    this.MarkSelectedChairAsSold();
    this.chairsInWork = [];
  }
  
  SailSelected(){
    //////////// try to block first
    //let selectedChairsComponents = this.chairList.filter(element=>{return element.chairStateInternal.s.isSelected == true})
    //let selectedChairs : Array<IChairStateViewModelInternal> = [];
    //selectedChairsComponents.forEach(component => {selectedChairs.push(component.chairStateInternal)});
    //let request : ISyncTicketsRequestViewModel = {
    // idHall: -1, // сервис подменит на нужный
    //  starts: this.sessionData.currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
    //  blockSeats: selectedChairs,
    //  hallState: []
    //};
    //this.apiServis.RoutSyncTickets(request).then(resoult => {this.UpdateHallState(resoult)});

  }

  FunkBtnUnderscoreTest() {
    //let s : number = 16;
    //console.log(s.toString(2));
    
    //printJS({printable :'forprint',  type : 'html'});
    
    //($ as any).print("#forprint");
    window.print();

  }

  CalculateChairPrice(status : IChairStateViewModelInternal ) : Array<ITicketCategoryPriceViewModel> {
    
    //let chairsCategoty : IGetHallResponseViewModel =  _.find(this.hallInfo.chairsCateoryInfo,element=>{return element.idHall == 1});
    let  chairsCategoty  = this.hallInfo.chairsCateoryInfo;
    let chairCategory = _.find(chairsCategoty.chairs, element => {return element.r == status.c.r && element.c == status.c.c});
    let prices = _.find(this.sessionData.currentSession.prices,  element => {return element.idSeatCategory == chairCategory.idSeatCategory});
    
    return prices.tickets;
    
  }

  SelectPriceChairInWork(price : number ,chairInWork : IChairStateViewModelInternal){
    this.chairsInWork[this.chairsInWork.indexOf(chairInWork)].p = price;  
    //this.chairsInWork.forEach(element => {
    //     if(element.c.r == chairInWork.c.r && element.c.c == chairInWork.c.c){
    //      element.p = price;    
    //     }
    //    });
    //console.log(this.chairsInWork);    
  }

  ChairsInWorkTotalSumm() : number {
    let total = 0;
    this.chairsInWork.forEach(element => {total = total+element.p})
    return total
  }

  OnChairSelectStatusChange(status : IChairStateViewModelInternal ){
    if (this.sessionData.currentSession) {
      // массив без обрабатываемого елемента
      let tempChairsInWork = _.filter(this.chairsInWork,element=>{return status.c.r != element.c.r || status.c.c != element.c.c;});
      if (status.s.isSelected) 
        {
          let chairPrices = this.CalculateChairPrice(status); 
          status.p = chairPrices[0].price;
          status.prices = chairPrices;
          
          tempChairsInWork.push(status);
        }
      this.chairsInWork = tempChairsInWork; 
    }
  }

  UpdateHallInfo()  {
    
    this.apiServis.RoutGetHallInfo().then(resoult => {this.hallInfo = resoult; console.log(this.hallInfo)})
                                     .catch(error => {this.hallInfo = null}) 
  }

  UpdateHallState(StateInfo : ISyncTicketsResponseViewModelInternal  ) {
    
    StateInfo.hallState.forEach(element =>
      {
        
        let foundChair = this.chairList.find(function(chair) 
        {
          return chair.chairStateInternal.c.r == element.c.r && chair.chairStateInternal.c.c == element.c.c;
        });
        
        
        foundChair.chairStateInternal = element;
      });
     
      this.changeDetector.detectChanges();  // не хочет обновить картинку автоматически хотя в 
      // свойства в дочерних обновлены а этот метод передергивает 
      // и себя и дочерние на предмет проверить изменения (является методом componentRef)
      this.hallStateLastSnapshot = StateInfo.hallState; 
  }
 
  SyncHallState(workChairList : Array<IChairStateViewModelInternal> , currentHallState :Array<IChairStateViewModelInternal>){
    
    let request : ISyncTicketsRequestViewModel = {
      idHall: -1, // сервис подменит на нужный
      starts: this.sessionData.currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
      blockSeats: workChairList,
      hallState: currentHallState
    };
    this.apiServis.RoutSyncTickets(request).then(resoult => {this.UpdateHallState(resoult)});
    
  }
 
  ClearHallState() {
    this.chairList.forEach(element  => 
      { 
        element.chairStateInternal.s = element.ChairStatusDefoult();
        
      });
    this.chairsInWork = [];  
    this.changeDetector.detectChanges();
  }

  OnSessionDataChange(sessionData) {
    this.sessionData = sessionData;
    this.ClearHallState();
    if (!this.hallInfo) 
      {
        this.UpdateHallInfo();
      } 
      
    if (sessionData.currentSession)
    {
      this.SyncHallState([],[]);
    }
  }

}
