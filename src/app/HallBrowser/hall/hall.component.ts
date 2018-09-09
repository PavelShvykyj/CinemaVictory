import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { HallChairComponent } from '../hall-chair/hall-chair.component';

import { IdataObject } from '../idata-object'
import * as _ from 'underscore';

@Component({
  selector: 'hall',
  templateUrl: './hall.component.html',
  styleUrls: ['./hall.component.css'],
})
export class HallComponent implements OnInit {
  
  @ViewChildren(HallChairComponent)
  private chairList : QueryList<HallChairComponent>;
  mouseStatusCoverByRow : IdataObject = 
  { 1: false,
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
  }

  constructor() { 
  }

  ngOnInit() {
  }
  

  OnmouseoverHallColumn(row) {
    
    this.mouseStatusCoverByRow[row] = true
  }

  OnmouseoutHallColumn(row){
    
    this.mouseStatusCoverByRow[row] = false
  }


  MarkSelectedChairAsSold() {
    let foundChair = this.chairList.find(function(chair) {
      return chair.status.isSelected == true;
    });

    
    while (foundChair != undefined)
    {
      foundChair.status.isSelected = false;
      foundChair.status.isSoled = true;
      foundChair = this.chairList.find(function(chair) {
        return chair.status.isSelected == true;
      });
    }
  }

  FunkBtnTest() {

    this.MarkSelectedChairAsSold();
  }
  
  FunkBtnUnderscoreTest() {
    alert(_.now());
  }

  OnSessionDataChange(sessionData) {
    console.log(sessionData);
  }

}
