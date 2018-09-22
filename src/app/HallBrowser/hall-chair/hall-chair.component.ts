import { Component, OnInit, OnChanges, Input,ChangeDetectionStrategy  } from '@angular/core';
import { IdataObject } from '../idata-object'
import { AngularFontAwesomeComponent } from 'angular-font-awesome'
import {IChairStatus}  from '../../iback-end'



@Component({
  selector: 'hall-chair',
  templateUrl: './hall-chair.component.html',
  styleUrls: ['./hall-chair.component.css']
})
export class HallChairComponent implements OnInit, OnChanges {
  @Input() chairID : number
  @Input() uniqID : string
  @Input() rowID : number
  @Input() status : IChairStatus  

  constructor() { 
    this.status = this.ChairStatusDefoult();
    

  }

  ngOnInit() {
  }

  ngOnChanges(){
    

  }

  OnClick(){
    
    if (this.status.isFree)
    {
      this.status.isFree = false;
      this.status.isSelected = true;
      
    }
    else if (this.status.isSelected)
    {
      this.status.isFree = true;
      this.status.isSelected = false;
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
