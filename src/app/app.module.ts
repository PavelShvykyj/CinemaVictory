import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'

import { AppComponent } from './app.component';
import { HallBrowserModule } from './HallBrowser/HallBrowser.module';
import { HallComponent } from './HallBrowser/hall/hall.component';
import { TicketPrintWievComponent } from './HallBrowser/ticket-print-wiev/ticket-print-wiev.component';
import { BackEndRouterModule } from './back-end-router/back-end-router.module';

import { BackEndWebModule } from './back-end-web/back-end-web.module';
import { LoggInModule } from './logg-in/logg-in.module';
import { LogginComponent } from './logg-in/loggin/loggin.component';

import { BackEndLocalModule } from './back-end-local/back-end-local.module'

const routes = [
    {path : '' , component : LogginComponent},
    {path : 'Ticket' , component : TicketPrintWievComponent},       
    {path : 'Hall' , component : HallComponent},       
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {useHash : true}),
    HallBrowserModule,
    BackEndRouterModule,
    BackEndWebModule,
    BackEndLocalModule,
    LoggInModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
