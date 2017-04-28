import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';

// services
import { LoggingService } from './services/logging/logging.service';
import { ChatCliService } from './services/cmdline/commandline.service';
import { BackendConnectionService } from './services/backend/connection/backend-connection.service';
import { ChatService } from './services/backend/chat/chat.service';

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
    ChatCliService,
    BackendConnectionService, 
    ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
