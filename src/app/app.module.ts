import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { HallBrowserModule } from './HallBrowser/HallBrowser.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HallBrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
