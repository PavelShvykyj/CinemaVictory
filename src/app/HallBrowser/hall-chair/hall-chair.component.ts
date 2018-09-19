import { Component, OnInit, Input } from '@angular/core';
import { IdataObject } from '../idata-object'
import { AngularFontAwesomeComponent } from 'angular-font-awesome'

export class ChairStatus implements IdataObject
{
  isFree                   = true;
  inReserving              = false;   
  isReserved               = false; 
  isSoled                  = false; 
  isSelected               = false;
  iniciator                = -1;
}

@Component({
  selector: 'hall-chair',
  templateUrl: './hall-chair.component.html',
  styleUrls: ['./hall-chair.component.css']
})
export class HallChairComponent implements OnInit {
  @Input() chairID : string
  @Input() uniqID : string
  @Input() rowID : string
  @Input() status : IdataObject = new ChairStatus; 

  constructor() { 
    this.uniqID = this.rowID+this.chairID;
    

  }

  ngOnInit() {
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

}
