import { Injectable } from '@angular/core';
import {
  IbackEnd,
  IDataFrom1C,
  ISyncTicketsRequestViewModel,
  ISyncTicketsResponseViewModelInternal,
  ILoggInData,
  IChairsStatusInSessionInfo,
  ICancelTicketRequestViewModel,
  IResponseData,
  ISessionData,
  IHallInfo
} from '../iback-end'

import { Observable } from 'rxjs/Observable';
import { IdataObject } from '../HallBrowser/idata-object';
import { Subject } from 'rxjs/Subject';
import * as _ from 'underscore';
import { reject } from 'q';


@Injectable()
export class RequestManagerService implements IbackEnd {

  private _changeHallState = new Subject<IChairsStatusInSessionInfo>();
  changeHallState$: Observable<IChairsStatusInSessionInfo> = this._changeHallState.asObservable();

  private _subj1CData = new Subject<string>();
  promise1CData$ = this._subj1CData.asObservable();

  private _subj1CPrintTickets = new Subject<string>();
  promise1CPrintTickets$ = this._subj1CPrintTickets.asObservable();

  private _subj1CGlobalParams = new Subject<string>();
  Observ1CGlobalParams$ = this._subj1CGlobalParams.asObservable();

  private _subj1CHallInfo = new Subject<string>();
  Observ1CHallInfo$ = this._subj1CHallInfo.asObservable();

  private _subj1CSessionsInfo = new Subject<string>();
  Observ1CSessionsInfo$ = this._subj1CSessionsInfo.asObservable();

  private _subj1CHallState = new Subject<string>();
  Observ1CHallState$ = this._subj1CHallState.asObservable();

  private _subj1CBuferState = new Subject<string>();
  Observ1CBuferState$ = this._subj1CBuferState.asObservable();

  RESERVE_PRICE = 3;
  RESPONSE_TIME_OUT = 3000;
  RESPONSE_WAIT_STEP = 500;
  LOCAL_SERVISE_BLOCED = true; // по умолчанию не ясно где сайт запускается, если в окружении 1С она его включит

  webUserName: string = "380662828954";
  webPassword: string = "Di4vF67KBw2T";
  localeUserName: string = "Atlantyka";

  constructor() {

  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // вызываем в компоненте он клик который генерит 1С (через наш сервис роутер)
  On1CDataIncome(data: string) {
    let data1C = JSON.parse(data);
    let point = data1C.point;

    switch (point) {
      case 'PrintTickets':
        this._subj1CPrintTickets.next(data);
      case 'GetGlobalParametrs':
        this._subj1CGlobalParams.next(data);
      case 'GetHallState':
        this._subj1CHallState.next(data);
      case 'SetHallState':
        this._subj1CHallState.next(data);
      case 'SessionsInfoGetByDate':
        this._subj1CSessionsInfo.next(data);
      case 'GetHallInfo':
        this._subj1CHallInfo.next(data);
      case 'GetBufer':
        this._subj1CBuferState.next(data);
      case 'GetBuferSize':
        this._subj1CBuferState.next(data);
      case 'ClearBufer':
        this._subj1CBuferState.next(data);
    }
  }

  getLocalUserName() {
    return this.localeUserName;
  }

  getUserData(): ILoggInData {
    return { userName: this.webUserName, password: this.webPassword }
  }

  LoggInByPass(userData: ILoggInData): Promise<IResponseData> {
    return
  }

  async IncrWithdelay(par: number, incr: number, delay: number): Promise<number> {
    let pause = await this.delay(delay);
    return par + incr;
  }

  SessionsInfoGetByDate(selectedDate: string): Promise<ISessionData> | null {
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<ISessionData>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    
    /// запись snapshot  in 1C buffer
    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;

    let myPromise: Promise<ISessionData> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CSessionsInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "SessionsInfoGetByDate", key: selectedDate })
      Call1C(dataTo1C);
      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        this.IncrWithdelay(timeRemain, step, step).then(res => { timeRemain = res });
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C).data);
      } else {
        reject({
          point: "SessionsInfoGetByDate",
          resoult: false,
          data: { errorText: "time out" }
        });
      }
    });
    return myPromise
  }

  GetHallInfo(): Promise<IHallInfo> | null {
    
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<IHallInfo>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '101',
        statusText : 'bloced 1С',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    
    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;
    let myPromise: Promise<IHallInfo> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CHallInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "GetHallInfo" })
      Call1C(dataTo1C);
      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        this.IncrWithdelay(timeRemain, step, step).then(res => { timeRemain = res });
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        
        resolve(JSON.parse(stringDataFrom1C).data);
      } else {
        reject({
          point: "GetHallInfo",
          resoult: false,
          data: { errorText: "time out" }
        });
      }
    });
    return myPromise
  }


  SyncTickets(currentState: ISyncTicketsRequestViewModel, inReservePaymentBufer? : IdataObject): Promise<ISyncTicketsResponseViewModelInternal> | null {
    
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<ISyncTicketsResponseViewModelInternal>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    
    let myPromise: Promise<ISyncTicketsResponseViewModelInternal> = new Promise((resolve, reject) => {
      this.GetHallState(currentState).then(dataFrom1C => {
        let newState: ISyncTicketsResponseViewModelInternal = (dataFrom1C.data as ISyncTicketsResponseViewModelInternal);
        if (currentState.blockSeats.length == 0 && currentState.hallState.length == 0) {
          /// просто вернуть как есть
          resolve(newState);
          return;
        }
        if (currentState.blockSeats.length != 0) {
          /// проверяем возможность заблокировать места 
          let disableBlock: boolean = false;
          currentState.blockSeats.forEach(blockSeat => {
            let currentSeat = _.find(newState.hallState, element => { return element.c.r == blockSeat.c.r && element.c.c == blockSeat.c.c });
            if (currentSeat) {
              if (currentSeat.s.inReserving || currentSeat.s.isReserved || currentSeat.s.isSoled) {
                disableBlock = true;
              }
            }
          });
          if (disableBlock) {
            /// Нет - возвращаем 406ую ошибку
            /// сруктура имитирует стуктуру двнных обычной ошибки от веб в которой текущиее состояние зашито
            let error = {
              staus: 406,
              error: { hallState: newState }
            };
            reject(error);
            return;
          }
          else {
            /// Да - инжектируем  блокировку
            currentState.blockSeats.forEach(blockSeat => {
              let currentSeat = _.find(newState.hallState, element => { return element.c.r == blockSeat.c.r && element.c.c == blockSeat.c.c });
              let index = newState.hallState.indexOf(currentSeat);
              blockSeat.s.isSelected = false;
              if (index >= 0) {
                newState.hallState.splice(index, 1, blockSeat);
              } else {
                newState.hallState.push(blockSeat)
              }

            });
          }
        }
        if (currentState.hallState.length != 0) {
          /// Безусловно инжектируем переданное
          currentState.hallState.forEach(actionSeat => {
            let currentSeat = _.find(newState.hallState, element => { return element.c.r == actionSeat.c.r && element.c.c == actionSeat.c.c });
            let index = newState.hallState.indexOf(currentSeat);
            actionSeat.s.isSelected = false;
            if (index >= 0) {
              newState.hallState.splice(index, 1, actionSeat);
            } else {
              newState.hallState.push(actionSeat)
            }
          });
        }
        /// Сохраняем новое состояние в 1С
        /// команду на блок мест выполнять нету смысла
        let buferData = [];
        if(inReservePaymentBufer){
          buferData.push(inReservePaymentBufer);
        }
        
        if (currentState.blockSeats.length == 0 && currentState.hallState.length == 0) {
          alert('empty currentState');
        }
        else if (currentState.blockSeats.length == 0) {
          buferData.push({ toDo: "SyncTickets", parametr: currentState });


          this.SetHallState(currentState, newState, buferData)
            .then(res => { resolve(newState); })
            .catch(err => {
              let error = { status: 100 };
              reject(error);
            });
        } else {
          this.SetHallState(currentState, newState)
            .then(res => { resolve(newState); })
            .catch(err => {
              let error = { status: 100 };
              reject(error);
            });
        }

      })
        .catch(ExtError => {
          /// точно не внутреннюю ошибку генерим
          let error = { status: 100 };
          reject(error);
        });
      /// из  currentState вычитываем параметры зал сесиия получаем ключ 
      /// по ключу получаем снепшот зала
      /// дополняем снепшот зала данными из масивов халлстате и блокситс

      /// возвращаем заполненный снепшот
      /// вызываем this.SetHallState(currentState : ISyncTicketsRequestViewModel ,resoult : ISyncTicketsResponseViewModelInternal)
      /// что бы запомнить текущий снепшот
      /// если работают 2 кассы придумать блокировку и возврат ошибок
      /// если снепшот успешно записан поставить команду в буфер передачи на сервер - это отдельная таблица должна быть
    })
    return myPromise;
  }

  CancelTickets(TicketsToCancel: ICancelTicketRequestViewModel): Promise<number> {
    
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<number>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    
    
    /// получили текущий статус - вычистили места на удаление и сохранили обновленный
    let myPromise: Promise<number> = new Promise((resolve, reject) => {
      let reqestForHallState = {
        starts: TicketsToCancel.starts,
        idHall: TicketsToCancel.idHall,
        blockSeats: [],
        hallState: []
      };
      this.GetHallState(reqestForHallState)
        .then(dataFrom1C => {
          let newState: ISyncTicketsResponseViewModelInternal = (dataFrom1C.data as ISyncTicketsResponseViewModelInternal);
          TicketsToCancel.chairs.forEach(seat => {
            let currentSeat = _.find(newState.hallState, element => { return element.c.r == seat.r && element.c.c == seat.c });
            let index = newState.hallState.indexOf(currentSeat);
            if (index >= 0) {
              newState.hallState.splice(index, 1);
            }
          });

          /// Сохраняем новое состояние в 1С
          let buferData = [{ toDo: "CancelTickets", parametr: TicketsToCancel }];
          this.SetHallState(reqestForHallState, newState, buferData)
            .then(res => { resolve(200) })
            .catch(err => { reject(100) });
        })
        .catch(err => { reject(100) });
    });
    return myPromise
  }

  SetHallInfo(hallInfo: IHallInfo) {
   
    if (this.LOCAL_SERVISE_BLOCED){
      return ;
    }
    
    
    /// запись snapshot HallInfo in 1C buffer
    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;
    let myPromise: Promise<IDataFrom1C> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CHallInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "SetHallInfo", data: hallInfo })
      Call1C(dataTo1C);
      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        timeRemain = timeRemain + step;
        async () => { await this.delay(step) };
        //setTimeout(()=>{},step);
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C));
      } else {
        reject({
          point: "SetHallInfo",
          resoult: false,
          data: { errorText: "time out" }
        });
      }
    });
    return myPromise
  }

  SetSessionsInfoGetByDate(selectedDate: string, sessionData: ISessionData) {
    
    if (this.LOCAL_SERVISE_BLOCED){
      return;
    }
    
    /// запись snapshot  in 1C buffer
    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;
    let myPromise: Promise<IDataFrom1C> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CSessionsInfo$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "SetSessionsInfoGetByDate", data: sessionData, key: selectedDate })
      Call1C(dataTo1C);

      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        timeRemain = timeRemain + step;
        async () => { await this.delay(step) };
        //setTimeout(()=>{},step);
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C));
      } else {
        reject({
          point: "SetSessionsInfoGetByDate",
          resoult: false,
          data: { errorText: "time out" }
        });
      }
    });
    return myPromise
  }

  SetHallState(currentState: ISyncTicketsRequestViewModel, syncTickets: ISyncTicketsResponseViewModelInternal, inBufer?: Array<IdataObject>): Promise<IDataFrom1C> {
    
    if (this.LOCAL_SERVISE_BLOCED){
      if (this.LOCAL_SERVISE_BLOCED){
        let myPromise : Promise<IDataFrom1C>  = new Promise((resolve,reject) => {
          let resoult : IDataFrom1C = 
          {
          resoult : true,
          data : {},
          point : 'bloced'
          }
          resolve(resoult);
        });
        return myPromise;
      }
    }
    
    
    /// из  currentState вычитываем параметры зал сесиия получаем ключ и записываем syncTickets как снепшот 
    /// запись snapshot  in 1C buffer
    let currentKey = { idHall: currentState.idHall, starts: currentState.starts };

    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;
    let myPromise: Promise<IDataFrom1C> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CHallState$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })

      let obj1CData = { data: syncTickets, Bufer: { makeBuffer: false, buferData: {} } };

      if (inBufer) {
        obj1CData.Bufer.makeBuffer = true;
        obj1CData.Bufer.buferData = inBufer;
      }

      let dataTo1C: string = JSON.stringify({ point: "SetHallState", data: obj1CData, key: currentKey })
      Call1C(dataTo1C);

      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        timeRemain = timeRemain + step;
        async () => { await this.delay(step) };
        //setTimeout(()=>{},step);
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C));
      } else {
        reject({
          point: "SetHallState",
          resoult: false,
          data: { errorText: "time out" }
        });
      }
    });
    return myPromise
  }

  GetBuffer(): Promise<IDataFrom1C> {
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<IDataFrom1C>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
 

    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;

    let myPromise: Promise<IDataFrom1C> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CBuferState$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "GetBufer" })
      Call1C(dataTo1C);

      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        timeRemain = timeRemain + step;
        async () => { await this.delay(step) };
        //setTimeout(()=>{},step);
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C));
      } else {
        reject({
          point: "GetBufer",
          resoult: false,
          data: { errorText: "time out", status: 100 }
        });
      }
    });
    return myPromise
  }

  GetBufferSize(): Promise<number> {
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<number>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
 

    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;

    let myPromise: Promise<number> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CBuferState$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "GetBuferSize" })
      Call1C(dataTo1C);

      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        timeRemain = timeRemain + step;
        async () => { await this.delay(step) };
        //setTimeout(()=>{},step);
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        let buferSize : number = JSON.parse(stringDataFrom1C).data;
        resolve(buferSize);
      } else {
        reject({
          point: "GetBuferSize",
          resoult: false,
          data: { errorText: "time out", status: 100 }
        });
      }
    });
    return myPromise
  }




  ///DataToClear = {keys : [string]}
  ///
  ///
  ClearBuffer(DataToClear: IdataObject): Promise<IDataFrom1C> {
    
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<IDataFrom1C>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
 
    
    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;

    let myPromise: Promise<IDataFrom1C> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CBuferState$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "ClearBufer", data: DataToClear })
      Call1C(dataTo1C);

      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        timeRemain = timeRemain + step;
        async () => { await this.delay(step) };
        //setTimeout(()=>{},step);
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C));
      } else {
        reject({
          point: "ClearBufer",
          resoult: false,
          data: { errorText: "time out", status: 100 }
        });
      }
    });
    return myPromise
  }

  GetHallState(currentState: ISyncTicketsRequestViewModel): Promise<IDataFrom1C> {
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<IDataFrom1C>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
 
    
    /// из  currentState вычитываем параметры зал сесиия получаем ключ и записываем syncTickets как снепшот 
    /// запись snapshot  in 1C buffer
    let currentKey = { idHall: currentState.idHall, starts: currentState.starts };
    let timeRemain: number = 0;
    let timeOut: number = this.RESPONSE_TIME_OUT;
    let step: number = this.RESPONSE_WAIT_STEP;
    let myPromise: Promise<IDataFrom1C> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CHallState$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "GetHallState", key: currentKey })
      Call1C(dataTo1C);
      while (stringDataFrom1C == "" && timeRemain <= timeOut) {
        this.IncrWithdelay(timeRemain, step, step).then(res => { timeRemain = res });
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C));
      } else {
        reject({
          point: "GetHallState",
          resoult: false,
          data: { errorText: "time out", status: 100 }
        });
      }
    });
    return myPromise
  }

  GetGlobalParametrs(): Promise<IDataFrom1C> {
    if (this.LOCAL_SERVISE_BLOCED){
      let myPromise : Promise<IDataFrom1C>  = new Promise((resolve,reject) => {
        let resoult : IResponseData = 
        {
        status : '100',
        statusText : 'bloced',
        token : 'badToken',
        expired : 0
        }
        reject(resoult);
      });
      return myPromise;
    }
    
    let myPromise: Promise<IDataFrom1C> = new Promise((resolve, reject) => {
      let stringDataFrom1C: string = '';
      let subs = this.Observ1CGlobalParams$.subscribe(resoult => {
        stringDataFrom1C = resoult;
      })
      let dataTo1C: string = JSON.stringify({ point: "GetGlobalParametrs" })
      Call1C(dataTo1C);
      let timeRenain = 0;
      while (stringDataFrom1C == "" && timeRenain <= this.RESPONSE_TIME_OUT) {
        timeRenain = timeRenain + this.RESPONSE_WAIT_STEP;
        let step = this.RESPONSE_WAIT_STEP
        async () => { await this.delay(step) };
        //setTimeout(()=>{},this.RESPONSE_WAIT_STEP);
      }
      subs.unsubscribe();
      if (stringDataFrom1C != "") {
        resolve(JSON.parse(stringDataFrom1C));
      } else {
        reject({
          point: "GetGlobalParametrs",
          resoult: false,
          data: { errorText: "time out" }
        });
      }
    });
    return myPromise
  }

  PrintTicets(DataTo1C: string): Promise<boolean> {
    if (this.LOCAL_SERVISE_BLOCED){
      
      let myPromise : Promise<boolean>  = new Promise((resolve,reject) => {
        resolve(true);
      });
      return myPromise;
    }
     
    
    let myPromise: Promise<boolean> = new Promise((resolve, reject) => {
      let stringDataFrom1C = "";
      let subs = this.promise1CPrintTickets$.subscribe(resuolt => {
        stringDataFrom1C = resuolt
      });
      Call1C(DataTo1C);
      /// встроить защиту по мамксимум времени т.е. если ждем более сколько то мили секунд перращаем и генерим ошибку
      let timeRenain = 0;
      while (stringDataFrom1C == "" && timeRenain <= this.RESPONSE_TIME_OUT) {
        timeRenain = timeRenain + this.RESPONSE_WAIT_STEP;
        let step = this.RESPONSE_WAIT_STEP;
        async () => { await this.delay(step) };
      }
      subs.unsubscribe();
      resolve(true);
    });
    return myPromise;//.then(res => {alert('then in myPromise'); return res});

  }

  //// Пустышки под Сигнал Р аналог
  StartHubbHallConnection() {
  }

  StopHubbHallConnection() {
  }

  OnHubbHallConnection() {
  }

  OfHubbHallConnection() {
  }

}
