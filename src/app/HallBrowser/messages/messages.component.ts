import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  @Input() historyLenth : number = 5;
  form = new FormGroup({messages : new FormArray([])})

  constructor() { }

  ngOnInit() {
  }

  get Messages(){
    return this.form.get('messages') as FormArray;
  }

  AddMessage(Message : string){
    let formMessages =  this.Messages;
    formMessages.push(new FormControl(Message));
    if(formMessages.controls.length > this.historyLenth){
      
      formMessages.removeAt(0);
    }
  }

  ClearMessages(){
    let formMessages =  this.Messages;
    while(formMessages.controls.length != 0){
      formMessages.removeAt(0);
    }
  }

  DeleteMessage(message : FormControl){
    let formMessages =  this.Messages;
    formMessages.removeAt(formMessages.controls.indexOf(message));
  }
}
