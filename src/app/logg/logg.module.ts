import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggOperatorService } from './logg-operator.service';
import { LoggBrowserComponent } from './logg-browser/logg-browser.component';
import { MapToIterable } from './logg-browser/Iterable.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  providers : [LoggOperatorService],
  exports: [LoggBrowserComponent],
  declarations: [LoggBrowserComponent, MapToIterable]
})
export class LoggModule { }
