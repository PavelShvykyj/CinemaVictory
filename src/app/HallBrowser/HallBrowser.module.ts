import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallComponent } from './hall/hall.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HallChairComponent } from './hall-chair/hall-chair.component';

@NgModule({
  imports: [
    CommonModule,
    AngularFontAwesomeModule
  ],
  declarations: [HallComponent, HallChairComponent],
  exports: [HallComponent]
})
export class HallBrowserModule { }
