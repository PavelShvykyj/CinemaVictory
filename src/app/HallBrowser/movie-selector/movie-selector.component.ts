import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'underscore';
import {RequestRouterService}  from '../../back-end-router/request-router.service';
import { ISessionData, IGetMovieResponseViewModel, IGetSessionResponseViewModel } from '../../iback-end';


@Component({
  selector: 'movie-selector',
  templateUrl: './movie-selector.component.html',
  styleUrls: ['./movie-selector.component.css']
})
export class MovieSelectorComponent implements OnInit {

  currentDate : Date;
  currentMovie : IGetMovieResponseViewModel ;
  currentSession : IGetSessionResponseViewModel;
  currentMovies : Array<any> = [];
  currentSessions : Array<any> = [];
  sessionData : ISessionData;
  @Output() sessionDataChange = new EventEmitter();

  constructor(private apiServis : RequestRouterService) { }
  ngOnInit() {}

  OnChangeDate(){
    // clear parametrs first 
    this.currentMovie = null;
    this.currentSession = null;
    this.sessionData = null;
    this.currentMovies = [];
    this.currentSessions = [];
    
    this.apiServis.RoutSessionsGetByDate(this.currentDate.toLocaleString())
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
