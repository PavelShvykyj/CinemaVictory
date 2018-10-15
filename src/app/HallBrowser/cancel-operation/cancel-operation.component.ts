import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, QueryList, EventEmitter} from '@angular/core';
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


enum FormActions {
  confirm,
  nothing
}

@Component({
  selector: 'cancel-operation',
  templateUrl: './cancel-operation.component.html',
  styleUrls: ['./cancel-operation.component.css']
})
export class CancelOperationComponent implements OnInit {

  @Output() CancelActionCancelEmmiter = new EventEmitter();

  FORM_ACTIONS : typeof FormActions = FormActions;  
  form : FormGroup;
  action : number = FormActions.nothing;  

  constructor() { 
    this.form   = new FormGroup({
      confirm : new FormControl('',[Validators.required,
                                   Validators.pattern(RegExp("подтвердить"))]) 
                                });   

  }

  ngOnInit() {
  }

  InputOnFocus(){    
    this.action = FormActions.nothing;
  }

  get confirm(){
    return this.form.get('confirm');
  }
  
  SetConfirm(value: string){
    this.confirm.setValue(value)
  }

  GetFormValidStatus() : boolean{
    switch (this.action) {
      case FormActions.nothing:
        return true;
      case FormActions.confirm:
        return this.confirm.valid;
    }
  }

  Confirm(){
    this.action = FormActions.confirm;
    if(!this.GetFormValidStatus()) {
      return;
    }
    this.CancelActionCancelEmmiter.emit();
    this.action = FormActions.nothing;
    this.SetConfirm('');
  }

  
}
