import { Component, OnInit, OnChanges, Input, Output ,EventEmitter ,ChangeDetectionStrategy  } from '@angular/core';
import { IdataObject } from '../idata-object'
import { AngularFontAwesomeComponent } from 'angular-font-awesome'
import {IChairStatus,IChairStateViewModelInternal}  from '../../iback-end'



@Component({
  selector: 'hall-chair',
  templateUrl: './hall-chair.component.html',
  styleUrls: ['./hall-chair.component.css']
})
export class HallChairComponent implements OnInit, OnChanges {
  @Input() chairID : number
  @Input() rowID : number
  @Input() chairStateInternal : IChairStateViewModelInternal
  @Output() chairSelectStatusChange = new EventEmitter();

  constructor() { 
   
  }

  ngOnInit() {
    this.chairStateInternal = {
      s : this.ChairStatusDefoult(),
      t : "",
      p : 0,
      c : {
            r : +this.rowID,
            c : +this.chairID
          } 
    }    
  }

  ngOnChanges(){}

  OnClick(){
    
    if (this.chairStateInternal.s.isFree)
    {
      this.chairStateInternal.s.isFree = false;
      this.chairStateInternal.s.isSelected = true;
      this.chairSelectStatusChange.emit(this.chairStateInternal);
      
    }
    else if (this.chairStateInternal.s.isSelected)
    {
      this.chairStateInternal.s.isFree = true;
      this.chairStateInternal.s.isSelected = false;
      this.chairSelectStatusChange.emit(this.chairStateInternal);
    }
  }

  ChairStatusDefoult() : IChairStatus
  {
   let status = { isFree     : true,
    inReserving              : false,   
    isReserved               : false, 
    isSoled                  : false, 
    isSelected               : false,
    iniciator                : -1,
    idTicketCategory         : 0};
    return status
  }
  

}
