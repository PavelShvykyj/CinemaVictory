import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogginComponent } from './loggin/loggin.component'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [LogginComponent],
  declarations: [LogginComponent]
})
export class LoggInModule { }
