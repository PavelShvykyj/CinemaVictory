import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import {RequestRouterService}  from '../../back-end-router/request-router.service';
import { ISessionData, IGetMovieResponseViewModel, IGetSessionResponseViewModel } from '../../iback-end';
import { IdataObject } from '../idata-object';

const ONE_DAY = 24*60*60*1000;





@Component({
  selector: 'movie-selector',
  templateUrl: './movie-selector.component.html',
  styleUrls: ['./movie-selector.component.css']
})
export class MovieSelectorComponent implements OnInit {

  currentDate : Date;
  currentDays : Array<IdataObject> = [];
  
  currentMovie : IGetMovieResponseViewModel ;
  currentSession : IGetSessionResponseViewModel;
  currentMovies : Array<any> = [];
  currentSessions : Array<any> = [];
  sessionData : ISessionData;
  @Output() sessionDataChange = new EventEmitter();

  constructor(private apiServis : RequestRouterService) { }
  ngOnInit() {
    let dayFormat = {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    
    let itemDay = new Date();
    
    for (let index = 0; index <= 6; index++) {
      itemDay.setDate(itemDay.getDate() + 1);
      
      this.currentDays.push({id : +itemDay, 
                             title : itemDay.toLocaleString("ru",dayFormat)
                            });
    };
  }

  OnChangeDate(value){
    // clear parametrs first 
    this.currentDate = new Date(+value);
    this.currentMovie = null;
    this.currentSession = null;
    this.sessionData = null;
    this.currentMovies = [];
    this.currentSessions = [];
    console.log(this.currentDate.toDateString());

    this.apiServis.RoutSessionsGetByDate(this.currentDate.toDateString())
                  .then(resoult => {
                    this.sessionData = resoult;
                    this.SessionDataParse();
                    this.sessionDataChange.emit(
                    {'currentDate' : this.currentDate, 
                      'currentMovie' : this.currentMovie,
                      'currentSession' : this.currentSession
                    });
                  });
  }

  OnChangeMovie(id){
    this.currentSession = null;
    this.currentSessions = [];
    this.currentMovie = _.find(this.currentMovies,element => {return element.id == id})
    this.currentSessions = _.filter(this.sessionData.sessionInfo, element => { return element.idMovie == id });
    this.sessionDataChange.emit(
      {'currentDate' : this.currentDate, 
        'currentMovie' : this.currentMovie,
        'currentSession' : this.currentSession
      });
  }

  OnChangeSession(id){
    this.currentSession = _.find(this.currentSessions,element => {return element.id == id})
    this.sessionDataChange.emit(
      {'currentDate' : this.currentDate, 
        'currentMovie' : this.currentMovie,
        'currentSession' : this.currentSession
      });
  }

  SessionDataParse(){
    
    let uniqMoviesID = _.uniq(this.sessionData.sessionInfo,true,session=>{return session.idMovie});
    uniqMoviesID.forEach(
      ID => {
      let found = this.sessionData
                      .movieInfo
                      .find(function(element) {return element.id ==  ID.idMovie;});
      
      this.currentMovies.push(found)                
    });
  }
}
