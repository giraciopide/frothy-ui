import { Component } from '@angular/core';
import { ElementRef, HostListener, Input } from '@angular/core';
import { ChatCliService } from './services/cmdline/commandline.service';
import { Message } from './services/messages';
import { LoggingService, Logger } from './services/logging/logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    cmdtext: string = null;
    title = 'app works!';

    private log: Logger;

    constructor(
        private cli: ChatCliService,
        logFactory: LoggingService) { 
        this.log = logFactory.getLogger('app-component');
    }

    // 
    // Events handlers
    // 

    @HostListener('window:keydown', ['$event'])
    keyboardInput(event: KeyboardEvent) {
        if (this.isCtrlEnter(event)) {
            this.onCommandSubmit(this.cmdtext);
        }
    }

    // 
    // Internal implementation
    // 

    private isCtrlEnter(event: KeyboardEvent) {
        return (event.ctrlKey && event.key == 'Enter');
    }

    onCommandSubmit(text: string) {
        let msg: Message = this.cli.parse(text);
        this.log.info(JSON.stringify(msg));
    }
}
