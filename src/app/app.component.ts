import { Component } from '@angular/core';
import { ElementRef, HostListener, Input } from '@angular/core';
import { ChatCliService, CliCommand } from './services/cmdline/commandline.service';
import { Message } from './services/messages';
import { LoggingService, Logger } from './services/logging/logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    cmdText: string = null;
    cmdHint: string = 'Type commands here i.e. /login badassNickName';
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
    @HostListener('keydown', ['$event'])
    keyboardInput(event: KeyboardEvent) {
        if (this.isCtrlEnter(event)) {
            this.onCommandSubmit(this.cmdText);
        }
    }

    // 
    // Internal implementation
    // 
    private isCtrlEnter(event: KeyboardEvent) {
        return (event.ctrlKey && event.key == 'Enter');
    }

    private onCommandSubmit(text: string) {
        let cmd: CliCommand = this.cli.parse(text);
        this.log.info(JSON.stringify(cmd));
        this.cmdText = null; // reset the cmd line text
        this.cmdHint = JSON.stringify(cmd); // show in the hint (placeholder) the cmd we sent
    }
}
