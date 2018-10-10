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

//import print from 'print-js'



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
  
  HALL_ID  = 1;
  CASH_DESK_ID = 1;

  constructor(private apiServis : RequestRouterService, private changeDetector : ChangeDetectorRef) { 
    this.hallState$ = apiServis.changeHallState$;
    this.hallStateSubscription = this.hallState$.subscribe(resoult => 
      {
        if (resoult.id == this.sessionData.currentSession.id)
          {
            console.log("signal ",resoult.chairsData);
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
  
  PrintSelected(){}

  RePrintSelected(){}

  StartSailSelected(){
    // если ничего не отмечено - ничего и не делаем
    if(this.chairsInWork.length==0){
      return
    }

    /// отмечаем ин прогресс и отправляем запрос
    this.chairsInWork.forEach(element =>{
      element.s.inReserving = true;
      element.s.iniciator = this.CASH_DESK_ID;
      element.s.isFree = false;
      element.s.isSoled = false;
      element.s.isReserved = false;
    })

    this.SyncHallState(this.chairsInWork,this.hallStateLastSnapshot)
        .then(resoult=>{
          /// заблокировали - теперь печатаем
          this.UpdateHallState(resoult);
          this.RePrintSelected();
        })
        .catch(error=>{
          ///  ели это ошибка одновременного использования - то просто чистим рабочие и переобновим зал
          if (error.status = 406)
          {
            this.SyncHallState([],[])
                .then(resoult => {this.UpdateHallState(resoult)})
                .catch(error=>{console.log('bad synk Tickets in start', error) }); /// 
  
          }
          ///  обнулим только выбранные - остальной зал не трогаем
          else
          {
            this.chairsInWork.forEach(workChair=>{
              let foundChair = this.chairList.find(function(chair) {
                return chair.chairStateInternal.c.c == workChair.c.c && chair.chairStateInternal.c.r == workChair.c.r;
              });
              foundChair.chairStateInternal.s = foundChair.ChairStatusDefoult();
            })
          }
          /// скидываем рабочие
          this.chairsInWork = [];
        })  
  }

  FinishSailSelected(){
      // если ничего не отмечено - ничего и не делаем
      if(this.chairsInWork.length==0){
        return
      };
  
      /// отмечаем в продажу и отправляем запрос
      this.chairsInWork.forEach(element =>{
        element.s.inReserving = false;
        element.s.iniciator = this.CASH_DESK_ID;
        element.s.isFree = false;
        element.s.isSoled = true;
        element.s.isReserved = false;
      });

      this.SyncHallState(this.chairsInWork,this.hallStateLastSnapshot)
          .then(resoult => {
            console.log('fifnish ', resoult);
            this.UpdateHallState(resoult);
            this.chairsInWork = [];
          })
          .catch(error=>{console.log('bad synk Tickets in finish', error)})
  }

  ReserveSelected(){
  }

  CancelSelected(){
  }

  FunkBtnUnderscoreTest() {
    //let s : number = 16;
    //console.log(s.toString(2));
    //console.log('print');
    //print({printable :'forprint',  type : 'html'});
    console.log(this.apiServis.RoutConvertTicketStatusToChairStatus(4098))
  }

  CalculateChairPrice(status : IChairStateViewModelInternal ) : Array<ITicketCategoryPriceViewModel> {
    
    //let chairsCategoty : IGetHallResponseViewModel =  _.find(this.hallInfo.chairsCateoryInfo,element=>{return element.idHall == 1});
    let  chairsCategoty  = this.hallInfo.chairsCateoryInfo;
    let chairCategory = _.find(chairsCategoty.chairs, element => {return element.r == status.c.r && element.c == status.c.c});
    let prices = _.find(this.sessionData.currentSession.prices,  element => {return element.idSeatCategory == chairCategory.idSeatCategory});
    
    return prices.tickets;
    
  }

  SelectPriceChairInWork(price : number, idTicketCategory : number,chairInWork : IChairStateViewModelInternal){
    this.chairsInWork[this.chairsInWork.indexOf(chairInWork)].p = price;  
    this.chairsInWork[this.chairsInWork.indexOf(chairInWork)].s.idTicketCategory = idTicketCategory;
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
          status.s.idTicketCategory = chairPrices[0].idTicketCategory;
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
        
        /// Нужно учесть что может прилететь ответ по уже выбранным билетам
        let foundChairInWork = _.find(this.chairsInWork,chair => {return chair.c.r == element.c.r && chair.c.c == element.c.c;})


        foundChair.chairStateInternal = element;
        /// прилетел обновленный статус для места отмеченного в работу 
        /// отмеим что он является выделенным (от сигнала isSelected всегда ложь)
        /// можно ли дальше с ним работать зависит от ответа это решается в функции продажи.
        /// есть поле инициатор в статусе если инициатор не мы нужно выкидывать из выделенных
        /// да еще как то специально отобразить касиру
        if (foundChairInWork){
          // прилетел сигнал по месту с которым мы начали работу  - все ок отмечаем 
          if(element.s.iniciator=this.CASH_DESK_ID){
            foundChairInWork.s = element.s;
            foundChairInWork.s.isSelected = true;
            foundChair.chairStateInternal.s.isSelected = true; 
          }
          // прилетел сигнал по чужому месту удалим его из выбранных
          else{
            this.chairsInWork = _.filter(this.chairsInWork,element=>{return foundChairInWork.c.r != element.c.r || foundChairInWork.c.c != element.c.c;});
          }
        }
      });
     
      this.changeDetector.detectChanges();  // не хочет обновить картинку автоматически хотя в 
      // свойства в дочерних обновлены а этот метод передергивает 
      // и себя и дочерние на предмет проверить изменения (является методом componentRef)
      this.hallStateLastSnapshot = StateInfo.hallState;
      console.log(this.hallStateLastSnapshot); 
  }
 
  /// готовит объект для запроса SyncTickets и вызывает его возвращает промис результат
  SyncHallState(workChairList : Array<IChairStateViewModelInternal> , currentHallState :Array<IChairStateViewModelInternal>) : Promise<ISyncTicketsResponseViewModelInternal> | null {
    
    let request : ISyncTicketsRequestViewModel = {
      idHall: this.HALL_ID, 
      starts: this.sessionData.currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
      blockSeats: workChairList,
      hallState: currentHallState
    };
    return this.apiServis.RoutSyncTickets(request)
    
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
      this.SyncHallState([],[])
          .then(resoult => {this.UpdateHallState(resoult)})
          .catch(error=>{console.log('bad synk Tickets', error) }); /// 
;
    }
  }

}
