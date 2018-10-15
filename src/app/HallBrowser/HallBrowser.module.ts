import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallComponent } from './hall/hall.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HallChairComponent } from './hall-chair/hall-chair.component';
import { MovieSelectorComponent } from './movie-selector/movie-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MovieComponent } from './movie/movie.component';
import { MoviePriceComponent } from './movie-price/movie-price.component';
import { TicketPrintWievComponent } from './ticket-print-wiev/ticket-print-wiev.component';
import { ReservingOperationsComponent } from './reserving-operations/reserving-operations.component';
import { CancelOperationComponent } from './cancel-operation/cancel-operation.component'

@NgModule({
  imports: [
    CommonModule,
    AngularFontAwesomeModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  declarations: [HallComponent, HallChairComponent, MovieSelectorComponent, MovieComponent, MoviePriceComponent, TicketPrintWievComponent, ReservingOperationsComponent, CancelOperationComponent],
  exports: [HallComponent]
})
export class HallBrowserModule { }
