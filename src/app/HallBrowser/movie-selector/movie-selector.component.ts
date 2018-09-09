import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import {RequestRouterService}  from '../../back-end-router/request-router.service';


@Component({
  selector: 'movie-selector',
  templateUrl: './movie-selector.component.html',
  styleUrls: ['./movie-selector.component.css']
})
export class MovieSelectorComponent implements OnInit {

  currentDate : Date ;
  currentMovie : String = "Фильм...";
  currentSession : String = "Сеанс...";
  currentMovies : Array<any> = [];
  currentSessions : Array<any> = [];

  @Output() sessionDataChange = new EventEmitter();


  constructor(private apiServis : RequestRouterService) { }

  ngOnInit() {
  }

  OnChangeDate(){
    this.sessionDataChange.emit(
      {'currentDate' : this.currentDate, 
        'currentMovie' : this.currentMovie,
        'currentSession' : this.currentSession
      });
  }

  OnChangeMovie(){
    this.sessionDataChange.emit(
      {'currentDate' : this.currentDate, 
        'currentMovie' : this.currentMovie,
        'currentSession' : this.currentSession
      });
  }

  OnChangeSession(){
    this.sessionDataChange.emit(
      {'currentDate' : this.currentDate, 
        'currentMovie' : this.currentMovie,
        'currentSession' : this.currentSession
      });
  }


}
