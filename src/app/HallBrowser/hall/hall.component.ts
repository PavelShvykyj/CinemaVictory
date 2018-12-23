import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';
import { MessagesComponent } from '../messages/messages.component';
import { ReservingOperationsComponent } from '../reserving-operations/reserving-operations.component';
import { CancelOperationComponent } from '../cancel-operation/cancel-operation.component';
import { SearchingOperationsComponent } from '../searching-operations/searching-operations.component';
import { RequestRouterService } from '../../back-end-router/request-router.service';
import { IdataObject } from '../idata-object'
import * as _ from 'underscore';
import {
  ISessionData,
  ISyncTicketsRequestViewModel,
  IChairsStatusInSessionInfo,
  IChairStateViewModelInternal,
  ICurrentSessionInfo,
  ISyncTicketsResponseViewModelInternal,
  IChairViewModel,
  IHallInfo,
  ICancelTicketRequestViewModel,
  IGetHallResponseViewModel,
  ITicketCategoryPriceViewModel
} from '../../iback-end';
import { Observable } from 'rxjs/Observable';
import printJS from 'print-js/src/index';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { HallShowStatus, MessageSate, TicketOperations } from '../../global_enums'

@Component({
  selector: 'hall',
  templateUrl: './hall.component.html',
  styleUrls: ['./hall.component.css'],
})
export class HallComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren(HallChairComponent)
  private chairList: QueryList<HallChairComponent>;

  @ViewChild(ReservingOperationsComponent)
  private reserveComponent: ReservingOperationsComponent;

  @ViewChild(CancelOperationComponent)
  private cancelComponent: CancelOperationComponent;

  @ViewChild(SearchingOperationsComponent)
  private searchComponent: SearchingOperationsComponent;

  @ViewChild(MessagesComponent)
  messageComponent: MessagesComponent;

  mouseStatusCoverByRow: IdataObject =
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

  sessionData: ICurrentSessionInfo =
    {
      currentDate: null,
      currentMovie: null,
      currentSession: null
    };

  hallInfo: IHallInfo;
  hallState$: Observable<IChairsStatusInSessionInfo>;
  hallStateSubscription;
  hallStateLastSnapshot = [];

  chairsInWork: Array<IChairStateViewModelInternal> = [];


  // определяю видимость формочек операций резерва и отмены билетов
  showHallStatus: typeof HallShowStatus = HallShowStatus;
  messageSate: typeof MessageSate = MessageSate;
  showStatus: number = this.showHallStatus.Defoult;


  GLOBAL_PARAMETRS;

  constructor(private apiServis: RequestRouterService, private changeDetector: ChangeDetectorRef) {
    this.hallState$ = apiServis.changeHallState$;
    this.hallStateSubscription = this.hallState$.subscribe(resoult => {
      //console.log('signal starts ',resoult.chairsData.starts);
      //console.log('current starts ',this.sessionData.currentSession.starts);
      if (resoult.id == this.sessionData.currentSession.id) {
        console.log("signal R");
        this.UpdateHallState(resoult.chairsData, true);
      }
    });
  }

  ngOnInit() {
    this.apiServis.RoutHubbHallReconnect();
    this.chairsInWork = [];
  }

  GetParametrs() {
    this.GLOBAL_PARAMETRS = this.apiServis.RoutGetParametrs();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.GetParametrs();
      this.UpdateHallInfo();
    }, 500);
  }

  ngOnDestroy() {
    this.hallStateSubscription.unsubscribe();
    this.apiServis.RoutOfHubbHallConnection();
    this.apiServis.RoutStopHubbHallConnection();
  }

  OnmouseoverHallColumn(row) {
    this.mouseStatusCoverByRow[row] = true
  }

  OnmouseoutHallColumn(row) {
    this.mouseStatusCoverByRow[row] = false
  }

  CreateSaleCode(element: IChairStateViewModelInternal): string {
    let code = "" + this.GLOBAL_PARAMETRS.HALL_ID +
      this.sessionData.currentSession.starts +
      element.c.c +
      element.c.r;
    code = code.replace(RegExp("-", 'g'), "")
      .replace(RegExp(" ", 'g'), "")
      .replace(RegExp(":", 'g'), "")
      .replace(RegExp("00", 'g'), "");

    let currentDate = new Date();
    let postfix = '' + currentDate.getHours() + currentDate.getMinutes() + currentDate.getSeconds() + currentDate.getMilliseconds();
    code = code + '-' + postfix;
    return code
  }

  CreateSecretCode(postfix: string): string {
    let prefix: string = '' +
      this.chairsInWork[0].c.c +
      this.chairsInWork[0].c.r +
      new Date().getMilliseconds().toString();
    let maxLenth = 6;
    let currentLenth = prefix.length;
    if (currentLenth < maxLenth) {
      for (let index = 0; index < maxLenth - currentLenth; index++) {
        prefix = prefix + '0';
      }
    }
    else {
      if (currentLenth > maxLenth) {
        prefix = prefix.substr(0, maxLenth - 1);
      }
    }
    //console.log('prefix', prefix);
    return prefix + '-' + postfix;
  }

  StartAction(): Promise<boolean> {
    return this.SyncHallState(this.chairsInWork, [], TicketOperations.Nothing)
      .then(resoult => {
        /// заблокировали 
        this.UpdateHallState(resoult);
        return true
      })
      .catch(error => {
        ///  ели это ошибка одновременного использования - то просто чистим рабочие и переобновим зал
        let errorStatus = this.apiServis.RoutGetStatusError(error);


        if (errorStatus = 406) {
          this.AddLongFormateMessage('места уже заняты', this.messageSate.Info);
          this.ClearSelected();
          this.SyncHallState([], [], TicketOperations.Nothing)
            .then(resoult => { this.UpdateHallState(resoult) })
            .catch(error => {
              let errorStatus = this.apiServis.RoutGetStatusError(error);
              this.AddFormateMessage('bad synk Tickets in start ' + errorStatus, this.messageSate.Error);
              console.log('bad synk Tickets in start', error);
              return false
            }); /// 
        }
        ///  обнулим только выбранные - остальной зал не трогаем
        else {
          this.AddFormateMessage(' error ' + errorStatus, this.messageSate.Error);
          this.chairsInWork.forEach(workChair => {
            let foundChair = this.chairList.find(function (chair) {
              return chair.chairStateInternal.c.c == workChair.c.c && chair.chairStateInternal.c.r == workChair.c.r;
            });
            foundChair.chairStateInternal.s = foundChair.ChairStatusDefoult();
          })
          this.ClearSelected();
        }
        /// скидываем рабочие
        this.chairsInWork = [];
        return false;
      })
  }

  FinishAction(operation: number): Promise<boolean> {
    return this.SyncHallState([], this.chairsInWork, operation)
      .then(resoult => {
        console.log('finish ok', resoult);
        if(operation == TicketOperations.Sale){
          /// этот кусок нужен только для отдельного вызова касс операции когда он жил на стартсаилселектед операция запишется сама в ыет холл стайт в 1С
          // let CassOperationParametr = {
          //   idHall: this.GLOBAL_PARAMETRS.HALL_ID,
          //   starts: this.sessionData.currentSession.starts,
          //   blockSeats: [],
          //   hallState: this.chairsInWork,
          //   ticketOperation: TicketOperations.Sale
          // }
          //this.apiServis.RoutSetCassOperation(CassOperationParametr).catch(err => { this.AddLongFormateMessage('Ошибка 1С при записи кассовой операции', this.messageSate.Error) });
          this.PrintSelected()
  
        }
        
        this.UpdateHallState(resoult);
        this.ClearSelected();
        return true;
      })
      .catch(error => {
        console.log('bad synk Tickets in finish', error);
        let errorStatus = this.apiServis.RoutGetStatusError(error);
        this.AddFormateMessage('finish actbad synk Tickets in finish ' + errorStatus, this.messageSate.Error);
        let errorHallState = undefined;
        if (typeof error.error != 'undefined') {
          if (typeof error.error.hallState != 'undefined') {
            let hallStateInError: ISyncTicketsResponseViewModelInternal = {
              hallState: error.error.hallState,
              starts: this.sessionData.currentSession.starts
            }
            this.UpdateHallState(hallStateInError);
          }
        }
        this.ClearSelected();
        return false;
      });
  }

  PrintSelected(toPrint?: Array<IChairStateViewModelInternal>) {
    if (!toPrint) {
      toPrint = this.chairsInWork;
    }

    toPrint = _.filter(toPrint, element => { return element.s.isSoled || element.s.inReserving || element.s.isReserved });

    if (toPrint.length == 0) {
      console.log('nothing to print');
      return;
    }

    if (!this.sessionData.currentSession) {
      console.log('nothing to print');
      return;
    }

    let printData = {
      chairs: toPrint,
      movie: this.sessionData
    }

    this.apiServis.RoutPrintBy1C(printData).then(resoult => {
      console.log("1C printed ", resoult);
    });
  }

  async StartSaleSelected() {
    // если ничего не отмечено - ничего и не делаем
    if (this.chairsInWork.length == 0) {
      return;
    }

    // если процесс начат повторно ничего не делаем
    let firstChairStatus = this.chairsInWork[0].s;
    if (firstChairStatus.inReserving || firstChairStatus.isReserved || firstChairStatus.isSoled) {
      return;
    }

    /// отмечаем ин прогресс и отправляем запрос
    this.chairsInWork.forEach(element => {
      element.s.inReserving = true;
      element.s.iniciator = this.GLOBAL_PARAMETRS.CASH_DESK_ID;
      element.s.isFree = false;
      element.s.isSoled = true;
      element.s.isReserved = false;
      element.t = this.CreateSaleCode(element);
    })

    // начинаем процесс продажи
    this.StartAction().then(resoult => {
      if (resoult) {
        this.showStatus = this.showHallStatus.StartSale;
        console.log('sucsessfull start');
        this.FinishSaleSelected();
        ////// преренесли на окончание продажи
        //  let CassOperationParametr = {idHall: this.GLOBAL_PARAMETRS.HALL_ID,
        //    starts: this.sessionData.currentSession.starts, 
        //    blockSeats: [],
        //    hallState: this.chairsInWork,
        //    ticketOperation : TicketOperations.Sale}

        // this.apiServis.RoutSetCassOperation(CassOperationParametr).catch(err=>{this.AddLongFormateMessage('Ошибка 1С при записи кассовой операции',this.messageSate.Error)});
        // this.PrintSelected()

      } else
      {
        this.showStatus = this.showHallStatus.Defoult;
        console.log('sucsessfull start');
        this.AddFormateMessage('error in StartSaleSelected',this.messageSate.Error);
      }
    });
  }

  FinishSaleSelected() {
    this.showStatus = this.showHallStatus.Defoult;
    // если ничего не отмечено - ничего и не делаем
    if (this.chairsInWork.length == 0) {
      return
    };

    // если процесс Не начат  ничего не делаем
    let firstChairStatus = this.chairsInWork[0].s;
    if (!(firstChairStatus.inReserving || firstChairStatus.isReserved || firstChairStatus.isSoled)) {
      return;
    }

    /// отмечаем в продажу и отправляем запрос
    this.chairsInWork.forEach(element => {
      element.s.inReserving = false;
      element.s.iniciator = this.GLOBAL_PARAMETRS.CASH_DESK_ID;
      element.s.isFree = false;
      element.s.isSoled = true;
      element.s.isReserved = false;

    });

    this.FinishAction(TicketOperations.Sale).then(resoult => {
      if (resoult) {
        console.log('sucsesful Sale.')
      }
    });
  }

  SearchOperationForm() {
    this.ClearSelected();
    if (this.showStatus == this.showHallStatus.Search) {
      this.showStatus = this.showHallStatus.Defoult;
    } else {
      this.showStatus = this.showHallStatus.Search
    };
  }

  ReserveOperationForm() {
    this.ClearSelected();

    if (this.showStatus == this.showHallStatus.Reserving) {
      this.showStatus = this.showHallStatus.Defoult;
    } else {
      this.showStatus = this.showHallStatus.Reserving
    };

  }

  CancelOperationForm() {
    this.ClearSelected();
    if (this.showStatus == this.showHallStatus.Cancel) {
      this.showStatus = this.showHallStatus.Defoult;
    } else {

      this.showStatus = this.showHallStatus.Cancel
      console.log('status ', this.showStatus);
    };


  }

  OnCancelActionCancel(WithPay: Boolean) {
    console.log('WithPay', WithPay);
    if (WithPay) {

      if (_.filter(this.chairsInWork, element => { return (element.s.isReserved) }).length != 0) {
        this.cancelComponent.ShowMessage('Нелья отменить выбранные с оплатой', this.messageSate.Info);
        return;
      }
      this.CancelTickets(TicketOperations.CanselPay);

    }
    else {
      if (_.filter(this.chairsInWork, element => { return !(element.s.isReserved) }).length != 0) {
        this.cancelComponent.ShowMessage('Нелья отменить выбранные без оплаты', this.messageSate.Info);
        return;
      }

      this.CancelTickets(TicketOperations.Cansel);
    }
  }

  OnActionSearchByPhone(ActionFormValues: IdataObject) {
    /// почистили
    this.ClearSelected();

    if (this.showStatus == this.showHallStatus.Reserving) {
      this.reserveComponent.SetSecretCode('');
    } else if (this.showStatus == this.showHallStatus.Cancel) {
      this.cancelComponent.SetSecretCode('');
    }
    else if (this.showStatus == this.showHallStatus.Search) {
      this.searchComponent.SetSecretCode('');
    }

    let showReserving = (this.showStatus == this.showHallStatus.Reserving);
    let showSearch = (this.showStatus == this.showHallStatus.Search);

    /// поискали подходяшее место по телефону 
    let foundComponents = this.chairList.filter(function (chair) {
      if (chair.chairStateInternal.t) {
        //console.log('phone search ',chair.chairStateInternal.c.c,chair.chairStateInternal.c.r,chair.chairStateInternal.t)
        if (showReserving) {
          return chair.chairStateInternal.t.endsWith(ActionFormValues.phone) && chair.chairStateInternal.s.isReserved;
        }
        else if (showSearch) {
          return chair.chairStateInternal.t.endsWith(ActionFormValues.phone) && chair.chairStateInternal.s.isSoled;
        }
        else {
          return chair.chairStateInternal.t.endsWith(ActionFormValues.phone);
        }
      }
      return false;
    })

    /// если нашли отметили и места и сообщили код для сверки
    if (foundComponents.length != 0) {

      let foundCodes = [];
      foundComponents.forEach(foundComponent => { foundCodes.push(foundComponent.chairStateInternal.t.substr(0, foundComponent.chairStateInternal.t.lastIndexOf('-')).replace('-', '')) });
      let uniqCodes = _.uniq(foundCodes);


      if (this.showStatus == this.showHallStatus.Reserving) {
        this.reserveComponent.SetSecretCode(uniqCodes.join(';'));
      } else if (this.showStatus == this.showHallStatus.Cancel) {
        this.cancelComponent.SetSecretCode(uniqCodes.join(';'));
      } else if (this.showStatus == this.showHallStatus.Search) {
        this.searchComponent.SetSecretCode(uniqCodes.join(';'));
      }


      foundComponents.forEach(component => {
        component.chairStateInternal.s.isSelected = true;
        this.chairsInWork.push(component.chairStateInternal);
      })
      this.changeDetector.detectChanges();
    }
  }

  OnActionSearch(ActionFormValues: IdataObject) {
    /// почистили
    this.ClearSelected();

    if (this.showStatus == this.showHallStatus.Reserving) {
      this.reserveComponent.SetPhone('');
    }
    else if (this.showStatus == this.showHallStatus.Cancel) {
      this.cancelComponent.SetPhone('');
    }
    else if (this.showStatus == this.showHallStatus.Search) {
      this.searchComponent.SetPhone('');
    }



    let showReserving = (this.showStatus == this.showHallStatus.Reserving);
    let showSearch = (this.showStatus == this.showHallStatus.Search);
    //console.log('code in search', ActionFormValues.secretCode);
    //console.log('list in  search',this.chairList);
    /// поискали подходяшее место по коду 
    let foundComponents = this.chairList.filter(function (chair) {
      if (chair.chairStateInternal.t) {
        if (showReserving) {
          return chair.chairStateInternal.t.startsWith(ActionFormValues.secretCode) && chair.chairStateInternal.s.isReserved;
        }
        else if (showSearch) {
          return chair.chairStateInternal.t.startsWith(ActionFormValues.secretCode) && chair.chairStateInternal.s.isSoled;
        }
        else {
          return chair.chairStateInternal.t.startsWith(ActionFormValues.secretCode);
        }
      }
      return false;
    })

    /// если нашли отметиди и места и сообщили телефон для сверки
    if (foundComponents.length != 0) {
      let secretCode = foundComponents[0].chairStateInternal.t;


      if (showReserving) {
        this.reserveComponent.SetPhone(secretCode.substr(secretCode.lastIndexOf('-')).replace('-38', '').replace('-', ''));
      }
      else if (this.showStatus == this.showHallStatus.Cancel) {
        this.cancelComponent.SetPhone(secretCode.substr(secretCode.lastIndexOf('-')).replace('-38', '').replace('-', ''));
      }
      else if (this.showStatus == this.showHallStatus.Search) {
        this.searchComponent.SetPhone(secretCode.substr(secretCode.lastIndexOf('-')).replace('-38', '').replace('-', ''));
      }

      foundComponents.forEach(component => {
        component.chairStateInternal.s.isSelected = true;
        this.chairsInWork.push(component.chairStateInternal);
      })
      this.changeDetector.detectChanges();
    }
  }

  OnReserveActionPrint(ActionFormValues: IdataObject) {

    if (this.chairsInWork.length == 0) {
      return;
    }
    this.PrintSelected();

  }

  OnReserveActionPay(ActionFormValues: IdataObject) {
    // если ничего не отмечено - ничего и не делаем
    if (this.chairsInWork.length == 0) {
      return;
    }

    let inCorrectSelected = _.filter(this.chairsInWork, element => { return !element.s.isReserved });
    if (inCorrectSelected.length != 0) {
      this.reserveComponent.messagesComponent.AddMessage('Некорректные места для оплаты. Можно только забронированные', this.messageSate.Error);
      return;
    }

    // если процесс начат повторно ничего не делаем
    ///// тут это не работает
    //let firstChairStatus = this.chairsInWork[0].s;
    //if(firstChairStatus.inReserving || firstChairStatus.isReserved || firstChairStatus.isSoled){
    //  return;
    //}

    this.chairsInWork.forEach(element => {
      element.s.inReserving = false;
      element.s.iniciatorFirst = element.s.iniciator
      element.s.iniciator = this.GLOBAL_PARAMETRS.CASH_DESK_ID;
      element.s.isFree = false;
      element.s.isSoled = true;
      element.s.isReserved = false;
    })

    console.log('start pay', this.chairsInWork);
    /// предварительно блокировать при оплате ранее забронированных не нужно

    this.FinishAction(TicketOperations.SaleReserve).then(resoult => {
      if (resoult) {
        console.log('sucsesful pay.')
      }
    });
    this.PrintSelected();

  }

  OnActionResete() {
    this.ClearSelected();


    if (this.showStatus == this.showHallStatus.Reserving) {

      this.reserveComponent.SetPhone('');
      this.reserveComponent.SetSecretCode('');
    }

    else if (this.showStatus == this.showHallStatus.Cancel) {

      this.cancelComponent.SetPhone('');
      this.cancelComponent.SetSecretCode('');
    }

    else if (this.showStatus == this.showHallStatus.Search) {

      this.searchComponent.SetPhone('');
      this.searchComponent.SetSecretCode('');
    }
  }

  OnCancelActionResete() {
    this.OnActionResete();
  }

  OnReserveActionReserve(ActionFormValues: IdataObject) {
    // если ничего не отмечено - ничего и не делаем
    if (this.chairsInWork.length == 0) {
      return;
    }

    let inCorrectSelected = _.filter(this.chairsInWork, element => { return element.s.isSoled || element.s.isReserved || element.s.inReserving });
    if (inCorrectSelected.length != 0) {
      this.reserveComponent.messagesComponent.AddMessage('Некорректные места для бронирования. Можно только свободные.', this.messageSate.Error);
      return;
    }


    /// отмечаем "ин прогресс" генерим ключ и отправляем запрос
    let t = this.CreateSecretCode(ActionFormValues.phone);
    this.chairsInWork.forEach(element => {
      element.s.inReserving = true;
      element.s.iniciator = this.GLOBAL_PARAMETRS.CASH_DESK_ID;
      element.s.isFree = false;
      element.s.isSoled = false;
      element.s.isReserved = true;
      element.t = t;
    })

    // начинаем процесс продажи

    this.StartAction().then(resoult => {
      if (resoult) {
        /// отмечаем в резерв и отправляем запрос
        this.chairsInWork.forEach(element => {
          element.s.inReserving = false;
          element.s.iniciator = this.GLOBAL_PARAMETRS.CASH_DESK_ID;
          element.s.isFree = false;
          element.s.isSoled = false;
          element.s.isReserved = true;
          element.t = t;
        });
        this.FinishAction(TicketOperations.Reserve).then(resoult => {
          if (resoult) {
            console.log('sucsesful reserve.')
            this.reserveComponent.SetSecretCode(t.substr(0, 6));
          }
        });
      }
    });
  }


  CalculateChairPrice(status: IChairStateViewModelInternal): Array<ITicketCategoryPriceViewModel> {

    //let chairsCategoty : IGetHallResponseViewModel =  _.find(this.hallInfo.chairsCateoryInfo,element=>{return element.idHall == 1});
    let chairsCategoty = this.hallInfo.chairsCateoryInfo;
    let chairCategory = _.find(chairsCategoty.chairs, element => { return element.r == status.c.r && element.c == status.c.c });
    let prices = _.find(this.sessionData.currentSession.prices, element => { return element.idSeatCategory == chairCategory.idSeatCategory });

    return prices.tickets;

  }

  SelectPriceChairInWork(price: number, idTicketCategory: number, chairInWork: IChairStateViewModelInternal) {
    this.chairsInWork[this.chairsInWork.indexOf(chairInWork)].p = price;
    this.chairsInWork[this.chairsInWork.indexOf(chairInWork)].s.idTicketCategory = idTicketCategory;
    //this.chairsInWork.forEach(element => {
    //     if(element.c.r == chairInWork.c.r && element.c.c == chairInWork.c.c){
    //      element.p = price;    
    //     }
    //    });
    //console.log(this.chairsInWork);    
  }

  ChairsInWorkTotalSumm(): number {
    let total = 0;
    this.chairsInWork.forEach(element => {
      total = total + element.p
      // для билетов забронированных в инете для выкупа доплачиваем стоимость бронирования
      if (element.s.iniciator != 0 && element.s.isReserved) {
        total = total + this.GLOBAL_PARAMETRS.RESERVE_PRICE;
      }
    })
    return total
  }

  OnChairSelectStatusChange(status: IChairStateViewModelInternal) {

    if (this.sessionData.currentSession) {
      // массив без обрабатываемого елемента
      let tempChairsInWork = _.filter(this.chairsInWork, element => { return status.c.r != element.c.r || status.c.c != element.c.c; });
      if (status.s.isSelected) {
        let chairPrices = this.CalculateChairPrice(status);
        // console.log('status.p',status.p);
        // console.log('condition 1',(!status.p  && !(status.s.isSoled || status.s.isReserved || status.s.inReserving)));
        // console.log('condition 2',(status.p == 0 && !(status.s.isSoled || status.s.isReserved || status.s.inReserving)));
        if ((!status.p && !(status.s.isSoled || status.s.isReserved || status.s.inReserving)) || (status.p == 0 && !(status.s.isSoled || status.s.isReserved || status.s.inReserving))) {
          // console.log('переназначили цены');
          status.p = chairPrices[0].price;
          status.s.idTicketCategory = chairPrices[0].idTicketCategory;
        }

        status.prices = chairPrices;

        tempChairsInWork.push(status);
      }
      this.chairsInWork = tempChairsInWork;
    }
  }

  UpdateHallInfo() {

    this.apiServis.RoutGetHallInfo().then(resoult => { this.hallInfo = resoult; })
      .catch(error => {
        this.AddFormateMessage('UpdateHallInfo ' + error.status, this.messageSate.Error);
        this.hallInfo = null
      })
  }

  UpdateHallState(StateInfo: ISyncTicketsResponseViewModelInternal, isSgnalRData?: boolean) {

    StateInfo.hallState.forEach(element => {

      let foundChair = this.chairList.find(function (chair) {
        return chair.chairStateInternal.c.r == element.c.r &&
          chair.chairStateInternal.c.c == element.c.c;
      });

      /// Нужно учесть что может прилететь ответ по уже выбранным билетам
      let foundChairInWork = _.find(this.chairsInWork, chair => {
        return chair.c.r == element.c.r &&
          chair.c.c == element.c.c;
      })
      /// от сигнала данные прилетают без т оградим себя пока так обновим только статус но это не панацея
      if (typeof foundChair == 'undefined') {
        console.log('место не найдено', element.c.c, element.c.r)
      }

      if (isSgnalRData) {
        foundChair.chairStateInternal.s = element.s
      }
      else {
        foundChair.chairStateInternal = element;
      }


      //console.log('t in component',foundChair.chairStateInternal.t);
      /// прилетел обновленный статус для места отмеченного в работу 
      /// отмеим что он является выделенным (от сигнала isSelected всегда ложь)
      /// можно ли дальше с ним работать зависит от ответа это решается в функции продажи.
      /// есть поле инициатор в статусе если инициатор не мы нужно выкидывать из выделенных
      /// да еще как то специально отобразить касиру
      if (foundChairInWork) {
        // прилетел сигнал по месту с которым мы начали работу  - все ок отмечаем 
        if (element.s.iniciator = this.GLOBAL_PARAMETRS.CASH_DESK_ID) {
          foundChairInWork.s = element.s;
          foundChairInWork.s.isSelected = true;
          foundChair.chairStateInternal.s.isSelected = true;
        }
        // прилетел сигнал по чужому месту удалим его из выбранных
        else {
          this.chairsInWork = _.filter(this.chairsInWork, element => { return foundChairInWork.c.r != element.c.r || foundChairInWork.c.c != element.c.c; });
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
  SyncHallState(workChairList: Array<IChairStateViewModelInternal>, currentHallState: Array<IChairStateViewModelInternal>, operation: number): Promise<ISyncTicketsResponseViewModelInternal> | null {

    let request: ISyncTicketsRequestViewModel = {
      idHall: this.GLOBAL_PARAMETRS.HALL_ID,
      starts: this.sessionData.currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
      blockSeats: workChairList,
      hallState: currentHallState,
      ticketOperation: operation
    };
    return this.apiServis.RoutSyncTickets(request);
  }

  /// готовит объект для запроса CancelTickets и вызывает его возвращает промис результат
  async CancelTickets(operation: number) {
    let ticketsToCancel: Array<IChairViewModel> = [];
    this.chairsInWork.forEach(element => {
      let ticket: IChairViewModel = { r: element.c.r, c: element.c.c }
      ticketsToCancel.push(ticket);
    })
    //console.log('cancel in hall',ticketsToCancel);
    if (ticketsToCancel.length == 0) {
      return;
    }

    let request: ICancelTicketRequestViewModel = {
      idHall: this.GLOBAL_PARAMETRS.HALL_ID,
      starts: this.sessionData.currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
      chairs: ticketsToCancel,
      ticketOperation: operation
    };
    /// почему то этот метод не возвращает текущее состояние зала
    /// поэтому вынуждены запрашивать обновление
    /// и записывать кассовую операцию отдельно
    let cassOperationRequest: ISyncTicketsRequestViewModel = {
      idHall: this.GLOBAL_PARAMETRS.HALL_ID,
      starts: this.sessionData.currentSession.starts, //"yyyy-MM-dd HH:mm:ss",		
      blockSeats: [],
      hallState: this.chairsInWork,
      ticketOperation: operation
    };

    if (operation == TicketOperations.CanselPay) {
      await this.apiServis.RoutSetCassOperation(cassOperationRequest).catch(err => { this.AddLongFormateMessage('Ошибка 1С при записи кассовой операции', this.messageSate.Error) });
    }
    this.apiServis.RoutCancelTickets(request)
      .then(resoult => {
        this.ClearSelected();
        this.RefreshHallState()
      })
      .catch(error => {
        this.AddFormateMessage('Cancel tickets ' + error.status, this.messageSate.Error);
        this.ClearSelected();
        this.RefreshHallState()
      });
  }


  ClearSelected() {
    this.chairsInWork = [];
    let foundComponents = this.chairList.filter(function (chair) {
      return chair.chairStateInternal.s.isSelected;
    }
    )
    foundComponents.forEach(component => {
      component.chairStateInternal.s.isSelected = false;
      if (!(component.chairStateInternal.s.isSoled ||
        component.chairStateInternal.s.isReserved ||
        component.chairStateInternal.s.inReserving)) {
        component.chairStateInternal.s.isFree = true;
      }

    })
    this.changeDetector.detectChanges();
  }

  ClearHallState() {
    this.chairList.forEach(element => {
      element.chairStateInternal.s = element.ChairStatusDefoult();
      element.chairStateInternal.t = "";
      element.chairStateInternal.p = 0;
      element.chairStateInternal.prices = [];
    });
    this.chairsInWork = [];
    this.changeDetector.detectChanges();
  }

  RefreshHallState() {
    this.OnSessionDataChange(this.sessionData);
  }

  OnSessionDataChange(sessionData) {
    this.sessionData = sessionData;
    this.ClearHallState();
    if (!this.hallInfo) {
      this.UpdateHallInfo();
    }
    if (sessionData.currentSession) {
      this.SyncHallState([], [], TicketOperations.Nothing)
        .then(resoult => { this.UpdateHallState(resoult) })
        .catch(error => {
          this.AddFormateMessage('On sesiion data change ' + error.status, this.messageSate.Error);
          console.log('bad synk Tickets', error)
        }); /// 
    }
  }

  async  ExecuteQueue() {
    let size = await this.apiServis.RoutGetBufferSize();
    this.AddFormateMessage('Отправляю данные ( всего ' + size + ')', this.messageSate.Info);
    try {
      let res = await this.apiServis.RoutExecuteBufer();
      size = await this.apiServis.RoutGetBufferSize();
      if (size == 0) {
        this.AddFormateMessage('Осталось неотправленных ' + size, this.messageSate.Sucsess);
      }
      else {
        this.AddFormateMessage('Осталось неотправленных ' + size, this.messageSate.Error);
      }

    } catch (error) {
      this.AddFormateMessage('Ошибка при передаче данных', this.messageSate.Error);
    }
  }

  AddFormateMessage(message: string, imp: number) {
    this.messageComponent.AddMessage(new Date().toISOString() + ' ' + message, imp);
    setTimeout(() => {
      this.messageComponent.ClearMessages();
    }, 5000);
  }

  AddLongFormateMessage(message: string, imp: number) {
    this.messageComponent.AddMessage(new Date().toISOString() + ' ' + message, imp);
  }


  async Refresh1CData() {
    this.AddLongFormateMessage('Попытка пердачи двнных в 1С...', this.messageSate.Info);
    let today = new Date();
    let itemDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10, 0, 0, 0, 0);
    console.log(itemDay);
    /// 19 = 10 дней назад + 9 дней вперед 
    let stopByError = false;
    for (let index = 0; index <= 19; index++) {

      itemDay.setDate(itemDay.getDate() + 1);

      await this.apiServis.RoutSyncWebTo1C(this.GLOBAL_PARAMETRS.HALL_ID, TicketOperations.Nothing, itemDay)
        .then(res => { this.AddLongFormateMessage('Обработано ' + index, this.messageSate.Info); })
        .catch(err => { this.AddLongFormateMessage('Ошибка на шаге ' + index + ' ' + err, this.messageSate.Error); stopByError = true });
      if (stopByError) { break };
    }
    if (stopByError) {
      this.AddLongFormateMessage('Ошибки при передаче данных в 1С', this.messageSate.Error);
    }
    else {
      this.AddFormateMessage('Завершена попытка пердачи данных в 1С', this.messageSate.Info);
    }

  }

}
