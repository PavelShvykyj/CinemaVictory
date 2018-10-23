import { Component, OnInit,OnDestroy , ViewChildren, QueryList,ViewChild ,ChangeDetectorRef } from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';
import { ReservingOperationsComponent } from '../reserving-operations/reserving-operations.component';
import { CancelOperationComponent } from '../cancel-operation/cancel-operation.component';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { IdataObject } from '../idata-object'
import * as _ from 'underscore';
import { ISessionData,
         ISyncTicketsRequestViewModel,
         IChairsStatusInSessionInfo,
         IChairStateViewModelInternal,
         ICurrentSessionInfo,
         ISyncTicketsResponseViewModelInternal,
         IChairViewModel,
         IHallInfo, 
         ICancelTicketRequestViewModel,
         IGetHallResponseViewModel,
         ITicketCategoryPriceViewModel} from '../../iback-end';
import { Observable } from 'rxjs/Observable';
import printJS from 'print-js/src/index';
import { IfObservable } from 'rxjs/observable/IfObservable';


@Component({
  selector: 'hall',
  templateUrl: './hall.component.html',
  styleUrls: ['./hall.component.css'],
})
export class HallComponent implements OnInit, OnDestroy {
  
  @ViewChildren(HallChairComponent)
  private chairList : QueryList<HallChairComponent>;
  @ViewChild(ReservingOperationsComponent)
  private reserveComponent : ReservingOperationsComponent;
  
  @ViewChild(CancelOperationComponent)
  private cancelComponent : ReservingOperationsComponent;
  

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

  // определяю видимость формочек операций резерва и отмены билетов
  showReserving = false;
  showCancel    = false;

  HALL_ID  = 1;
  CASH_DESK_ID = 1;

  constructor(private apiServis : RequestRouterService, private changeDetector : ChangeDetectorRef) { 
    this.hallState$ = apiServis.changeHallState$;
    this.hallStateSubscription = this.hallState$.subscribe(resoult => 
      {
        //console.log('signal starts ',resoult.chairsData.starts);
        //console.log('current starts ',this.sessionData.currentSession.starts);
        if (resoult.id == this.sessionData.currentSession.id)
          {
            console.log("signal R");
            this.UpdateHallState(resoult.chairsData,true);
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
  
  CreateSecretCode(postfix : string) : string {
    let prefix : string = ''+
                          this.chairsInWork[0].c.c+
                          this.chairsInWork[0].c.r+
                          new Date().getMilliseconds().toString();
    let maxLenth = 6;
    let currentLenth = prefix.length;
    if(currentLenth < maxLenth)
    {
      for (let index = 0; index <maxLenth-currentLenth; index++) {
        prefix = prefix + '0';
      }
    } 
    else
      {
        if(currentLenth > maxLenth)
          {
            prefix = prefix.substr(0,maxLenth-1);
          }
      } 
    //console.log('prefix', prefix);
    return prefix + '-' + postfix;
  }

  StartAction() : Promise<boolean> {
   return this.SyncHallState(this.chairsInWork,[])
        .then(resoult=>{
          /// заблокировали 
          this.UpdateHallState(resoult);
          return true
        })
        .catch(error=>{
          ///  ели это ошибка одновременного использования - то просто чистим рабочие и переобновим зал
          if (error.status = 406)
          {
            this.SyncHallState([],[])
                .then(resoult => {this.UpdateHallState(resoult)})
                .catch(error=>{console.log('bad synk Tickets in start', error); return false }); /// 
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
          return false;
        })  
  }

  FinishAction() : Promise<boolean> {
   return this.SyncHallState([],this.chairsInWork)
    .then(resoult => {
      console.log('finish ok', resoult);
      this.chairsInWork = [];
      this.UpdateHallState(resoult);
      return true;
    })
    .catch(error=>{
      console.log('bad synk Tickets in finish', error);
      if(error.error.hallState){
        let hallStateInError : ISyncTicketsResponseViewModelInternal = {
          hallState: error.error.hallState,
          starts : this.sessionData.currentSession.starts
        }
        this.chairsInWork = [];
        this.UpdateHallState(hallStateInError);
        return false;
      }
    });
  }

  PrintSelected(){}


  StartSailSelected(){
    // если ничего не отмечено - ничего и не делаем
    if(this.chairsInWork.length==0){
      return;
    }

    // если процесс начат повторно ничего не делаем
    let firstChairStatus = this.chairsInWork[0].s;
    if(firstChairStatus.inReserving || firstChairStatus.isReserved || firstChairStatus.isSoled){
      return;
    }

    /// отмечаем ин прогресс и отправляем запрос
    this.chairsInWork.forEach(element =>{
      element.s.inReserving = true;
      element.s.iniciator = this.CASH_DESK_ID;
      element.s.isFree = false;
      element.s.isSoled = true;
      element.s.isReserved = false;
    })

    // начинаем процесс продажи
    this.StartAction().then(resoult => { if(resoult){this.PrintSelected()} });

  }

  FinishSailSelected(){
      // если ничего не отмечено - ничего и не делаем
      if(this.chairsInWork.length==0){
        return
      };
  
      // если процесс Не начат  ничего не делаем
      let firstChairStatus = this.chairsInWork[0].s;
      if (!(firstChairStatus.inReserving || firstChairStatus.isReserved || firstChairStatus.isSoled)){
        return;
      }

      /// отмечаем в продажу и отправляем запрос
      this.chairsInWork.forEach(element =>{
        element.s.inReserving = false;
        element.s.iniciator = this.CASH_DESK_ID;
        element.s.isFree = false;
        element.s.isSoled = true;
        element.s.isReserved = false;
      });

      this.FinishAction().then(resoult=>{if(resoult){console.log('sucsesful sail.')}});
  }

  StartCancel(){
    
  }

  ReserveOperationForm(){
    this.ClearSelected();
    this.showReserving = !this.showReserving;
    this.showCancel = false;

  }

  CancelOperationForm(){
    
    this.ClearSelected();
    this.showCancel = !this.showCancel;
    this.showReserving = false;
  }

  OnCancelActionCancel(){
    this.CancelTickets();
  }

  OnActionSearchByPhone(RerserveFormValues : IdataObject){
    /// почистили
    this.ClearSelected();
    
    if(this.showReserving) 
    {
      this.reserveComponent.SetSecretCode('');  
    } else {
      this.cancelComponent.SetSecretCode('');
    } 
    
    let showReserving = this.showReserving;
    
    /// поискали подходяшее место по телефону 
    let foundComponents  = this.chairList.filter(function(chair) {
      if (chair.chairStateInternal.t){
        //console.log('phone search ',chair.chairStateInternal.c.c,chair.chairStateInternal.c.r,chair.chairStateInternal.t)
        if(showReserving){
          return chair.chairStateInternal.t.endsWith(RerserveFormValues.phone) && chair.chairStateInternal.s.isReserved;
        }
        else{
          return chair.chairStateInternal.t.endsWith(RerserveFormValues.phone);
        }
      }
      return false;
    }) 
    
    /// если нашли отметили и места и сообщили код для сверки
    if(foundComponents.length !=0){
      let secretCode = '';//foundComponents[0].chairStateInternal.t;
      
      foundComponents.forEach(foundComponent=>{secretCode = secretCode+foundComponent.chairStateInternal.t.substr(0,foundComponent.chairStateInternal.t.lastIndexOf('-')).replace('-','')+'-'});

      if(this.showReserving) {
        this.reserveComponent.SetSecretCode(secretCode) ;
      } else  {
        this.cancelComponent.SetSecretCode(secretCode) ;
      } 
         
      
      foundComponents.forEach(component=>{
        component.chairStateInternal.s.isSelected = true;
        this.chairsInWork.push(component.chairStateInternal);
      })
      this.changeDetector.detectChanges();
    }   
  }

  OnActionSearch(RerserveFormValues : IdataObject){
    /// почистили
    this.ClearSelected();
    
    if(this.showReserving){
      this.reserveComponent.SetPhone('');
    }
    else
    {
      this.cancelComponent.SetPhone('');
    }
    
    let showReserving = this.showReserving;
    //console.log('code in search', RerserveFormValues.secretCode);
    //console.log('list in  search',this.chairList);
    /// поискали подходяшее место по коду 
    let foundComponents  = this.chairList.filter(function(chair) {
      if (chair.chairStateInternal.t){
        if(showReserving){
          return chair.chairStateInternal.t.startsWith(RerserveFormValues.secretCode) && chair.chairStateInternal.s.isReserved;
        }
        else{
          return chair.chairStateInternal.t.startsWith(RerserveFormValues.secretCode);
        }
      }
      return false;
    }) 
    
    /// если нашли отметиди и места и сообщили телефон для сверки
    if(foundComponents.length !=0){
      let secretCode = foundComponents[0].chairStateInternal.t;
      
      
      if(this.showReserving){
        this.reserveComponent.SetPhone(secretCode.substr(secretCode.lastIndexOf('-')).replace('-38','').replace('-',''));
      }
       else {
        this.cancelComponent.SetPhone(secretCode.substr(secretCode.lastIndexOf('-')).replace('-38','').replace('-','')) ;
      }
      
      foundComponents.forEach(component=>{
        component.chairStateInternal.s.isSelected = true;
        this.chairsInWork.push(component.chairStateInternal);
      })
      this.changeDetector.detectChanges();
    }
  }

  OnReserveActionPrint(RerserveFormValues : IdataObject){

    if(this.chairsInWork.length==0){
      return;
    }
    this.PrintSelected();

  }

  OnReserveActionPay(RerserveFormValues : IdataObject){
    // если ничего не отмечено - ничего и не делаем
    if(this.chairsInWork.length==0){
      return;
    }

    // если процесс начат повторно ничего не делаем
    ///// тут это не работает
    //let firstChairStatus = this.chairsInWork[0].s;
    //if(firstChairStatus.inReserving || firstChairStatus.isReserved || firstChairStatus.isSoled){
    //  return;
    //}
   
    this.chairsInWork.forEach(element =>{
      element.s.inReserving = false;
      element.s.iniciator = this.CASH_DESK_ID;
      element.s.isFree = false;
      element.s.isSoled = true;
      element.s.isReserved = false;
    })
    
    console.log('start pay',this.chairsInWork);
    /// предварительно блокировать при оплате ранее забронированных не нужно
    this.FinishAction().then(resoult=>
      {
        if(resoult){
          console.log('sucsesful pay.')
        }
    });
  }

  OnActionResete(){
    this.ClearSelected();
    if(this.showReserving){
      this.reserveComponent.SetPhone('');
      this.reserveComponent.SetSecretCode('');
    }
    else{
      this.cancelComponent.SetPhone('');
      this.cancelComponent.SetSecretCode('');
    }
  
    
  }

  OnReserveActionReserve(RerserveFormValues : IdataObject){
        // если ничего не отмечено - ничего и не делаем
        if(this.chairsInWork.length==0){
          return;
        }
    
        // если процесс начат повторно ничего не делаем
        let firstChairStatus = this.chairsInWork[0].s;
        if(firstChairStatus.inReserving || firstChairStatus.isReserved || firstChairStatus.isSoled){
          return;
        }
        /// отмечаем "ин прогресс" генерим ключ и отправляем запрос
        let t = this.CreateSecretCode(RerserveFormValues.phone);
        this.chairsInWork.forEach(element =>{
          element.s.inReserving = true;
          element.s.iniciator = this.CASH_DESK_ID;
          element.s.isFree = false;
          element.s.isSoled = false;
          element.s.isReserved = true;
          element.t = t;
        })
    
        // начинаем процесс продажи
        
        this.StartAction().then(resoult => 
          { 
            if(resoult){
              /// отмечаем в резерв и отправляем запрос
              this.chairsInWork.forEach(element =>{
                element.s.inReserving = false;
                element.s.iniciator = this.CASH_DESK_ID;
                element.s.isFree = false;
                element.s.isSoled = false;
                element.s.isReserved = true;
                element.t = t;
              });
              this.FinishAction().then(resoult=>{
                if(resoult){
                  console.log('sucsesful reserve.')
                  this.reserveComponent.SetSecretCode(t.substr(0,6));
                }
              });
            }
          });
  }

  FunkBtnUnderscoreTest() {
    //printJS({printable :'forprint', type : 'html'});
    //let s : number = 16;
    //console.log(s.toString(2));
    //console.log('print');
    //print({printable :'forprint',  type : 'html'});
    //console.log(this.apiServis.RoutConvertTicketStatusToChairStatus(4098))

    //let encrypt = this.apiServis.RoutEncrypt("120061");
    //console.log(encrypt);
    //let decrypt = this.apiServis.RoutDecrypt(encrypt);
    //console.log(decrypt);
    //console.log(this.chairList);


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
          if(!status.p || status.p == 0){
            status.p = chairPrices[0].price;
          }
          status.s.idTicketCategory = chairPrices[0].idTicketCategory;
          status.prices = chairPrices;
          
          tempChairsInWork.push(status);
        }
      this.chairsInWork = tempChairsInWork; 
    }
  }

  UpdateHallInfo()  {
    
    this.apiServis.RoutGetHallInfo().then(resoult => {this.hallInfo = resoult; })
                                     .catch(error => {this.hallInfo = null}) 
  }

  UpdateHallState(StateInfo : ISyncTicketsResponseViewModelInternal, isSgnalRData? : boolean  ) {
    
    StateInfo.hallState.forEach(element =>
      {
        
        let foundChair = this.chairList.find(function(chair) 
                                              {
                                                return chair.chairStateInternal.c.r == element.c.r &&
                                                       chair.chairStateInternal.c.c == element.c.c;
                                              });
        
        /// Нужно учесть что может прилететь ответ по уже выбранным билетам
        let foundChairInWork = _.find(this.chairsInWork,chair => {return chair.c.r == element.c.r && 
                                                                         chair.c.c == element.c.c;})
        /// от сигнала данные прилетают без т оградим себя пока так обновим только статус но это не панацея
        if(isSgnalRData){
          foundChair.chairStateInternal.s = element.s
        } 
        else{
          foundChair.chairStateInternal = element;
        }

        
        //console.log('t in component',foundChair.chairStateInternal.t);
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
      
      //console.log('list after update');
      //this.chairList.forEach(chair => {console.log(chair.chairStateInternal.c.c,chair.chairStateInternal.c.r,chair.chairStateInternal.t,chair.chairStateInternal.p)})
      
      //console.log(this.hallStateLastSnapshot); 
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
 
  /// готовит объект для запроса CancelTickets и вызывает его возвращает промис результат
  CancelTickets(){
    let ticketsToCancel : Array<IChairViewModel> = [];
    this.chairsInWork.forEach(element => {
      let ticket : IChairViewModel = {r: element.c.r  , c: element.c.c}
      ticketsToCancel.push(ticket);
    })
    //console.log('cancel in hall',ticketsToCancel);
    if(ticketsToCancel.length == 0){
      return;
    }
    
    let request : ICancelTicketRequestViewModel = {
      idHall: this.HALL_ID, 
      starts: this.sessionData.currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
      chairs : ticketsToCancel
      
    };
    /// почему то этот метод не возвращает текущее состояние зала
    /// поэтому вынуждены запрашивать обновление
    return this.apiServis.RoutCancelTickets(request)
                         .then(resoult=>{
                            this.ClearSelected();
                            this.RefreshHallState()})
                         .catch(error=>{
                            this.ClearSelected(); 
                            this.RefreshHallState()});
  }


  ClearSelected(){
    this.chairsInWork = [];  
    let foundComponents  = this.chairList.filter(function(chair) {
        return chair.chairStateInternal.s.isSelected;
      }
    ) 
    foundComponents.forEach(component=>{
      component.chairStateInternal.s.isSelected = false;
      if(!(component.chairStateInternal.s.isSoled ||
           component.chairStateInternal.s.isReserved ||
            component.chairStateInternal.s.inReserving)) {
              component.chairStateInternal.s.isFree = true;
            }

    })
    this.changeDetector.detectChanges();
  }

  ClearHallState() {
    this.chairList.forEach(element  => 
      { 
        element.chairStateInternal.s = element.ChairStatusDefoult();
        element.chairStateInternal.t = "";
        element.chairStateInternal.p = 0;
        element.chairStateInternal.prices = [];
      });
    this.chairsInWork = [];  
    this.changeDetector.detectChanges();
  }

  RefreshHallState(){
    this.OnSessionDataChange(this.sessionData);
  }

  OnSessionDataChange(sessionData) {
    this.sessionData = sessionData;
    this.ClearHallState();
    //console.log('list after clear');
    //this.chairList.forEach(chair => {console.log(chair.chairStateInternal.c.c,chair.chairStateInternal.c.r,chair.chairStateInternal.t)})
  
    
    if (!this.hallInfo) 
      {
        this.UpdateHallInfo();
      } 
      
    if (sessionData.currentSession)
    {
      this.SyncHallState([],[])
          .then(resoult => {this.UpdateHallState(resoult)})
          .catch(error=>{console.log('bad synk Tickets', error) }); /// 
    }
  
    

  }

}
