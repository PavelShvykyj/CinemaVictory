import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RequestRouterService} from './request-router.service'

@NgModule({
  imports: [
    CommonModule
  ],
  providers : [RequestRouterService],
  declarations: []
})
export class BackEndRouterModule { }
