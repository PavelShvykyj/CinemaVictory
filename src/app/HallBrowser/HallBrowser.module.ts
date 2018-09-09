import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallComponent } from './hall/hall.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HallChairComponent } from './hall-chair/hall-chair.component';
import { MovieSelectorComponent } from './movie-selector/movie-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  imports: [
    CommonModule,
    AngularFontAwesomeModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  declarations: [HallComponent, HallChairComponent, MovieSelectorComponent],
  exports: [HallComponent]
})
export class HallBrowserModule { }
