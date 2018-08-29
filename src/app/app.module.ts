import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HallBrowserModule } from './HallBrowser/HallBrowser.module';
import { BackEndRouterModule } from './back-end-router/back-end-router.module';
import { BackEndWebModule } from './back-end-web/back-end-web.module';
import { LoggInModule } from './logg-in/logg-in.module';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HallBrowserModule,
    BackEndRouterModule,
    BackEndWebModule,
    LoggInModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
