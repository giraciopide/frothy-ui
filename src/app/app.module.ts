import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';

// services
import { LoggingService } from './services/logging/logging.service';
import { ChatCliService } from './services/cmdline/commandline.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    LoggingService,
    ChatCliService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
