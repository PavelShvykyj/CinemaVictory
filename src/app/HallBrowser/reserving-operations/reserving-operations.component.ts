import { FormGroup, FormControl, Validators, AbstractFormGroupDirective } from '@angular/forms';
import { Component, OnInit, Input, Output, QueryList, } from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';

import { ISessionData,
  ISyncTicketsRequestViewModel,
  IChairsStatusInSessionInfo,
  IChairStateViewModelInternal,
  ICurrentSessionInfo,
  ISyncTicketsResponseViewModelInternal,
  IHallInfo, 
  IGetHallResponseViewModel,
  ITicketCategoryPriceViewModel} from '../../iback-end';
import { AngularFontAwesomeComponent } from 'angular-font-awesome'



@Component({
  selector: 'reserving-operations',
  templateUrl: './reserving-operations.component.html',
  styleUrls: ['./reserving-operations.component.css']
})
export class ReservingOperationsComponent implements OnInit {
  
  @Input()chairList : QueryList<HallChairComponent>;
  @Input()chairsInWork : Array<IChairStateViewModelInternal>;

  
  form : FormGroup;
  operation : string = '';

  constructor() { 
    this.form   = new FormGroup({
      phone : new FormControl(),
      secretCode :  new FormControl()
    })


  }

  ngOnInit() {
  }

  testQueryList(){
    //let foundChair = this.chairList.find(function(chair) {
    //  return chair.chairStateInternal.s.isSelected == true;
    //});
    //
    //if (foundChair){
    //  foundChair.chairStateInternal.s.isSelected = false;
    //}
  }

  get phone(){
    return this.form.get('phone');
  }
  
  get secretCode(){
    return this.form.get('secretCode');
  }

  Search(){
    this.operation = 'search';
  }

  Print(){
    this.operation = 'print';

  }

  Reserve(){
    this.operation = 'reserve';
  }

  Pay(){
    this.operation = 'pay';
  }


}
