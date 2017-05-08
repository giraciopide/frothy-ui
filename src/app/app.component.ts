import { Component } from '@angular/core';
import { ElementRef, HostListener, Input } from '@angular/core';
import { ChatCliService, CliCommand, LoginCliCommand, JoinRoomCliCommand, LeaveRoomCliCommand, WhisperCliCommand, SayCliCommand, ListRoomsCliCommand } from './services/cmdline/commandline.service';
import { ChatService, RoomInfo } from './services/backend/chat/chat.service';
import { ChatItem, RoomTalkItem, WhisperOutItem, WhisperInItem, NoticeItem } from './model/chat-items';
import { Message, Payload, WhisperFeedPayload, RoomChatFeedPayload, PeopleFeedPayload } from './services/messages';
import { LoggingService, Logger } from './services/logging/logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    //
    // outbout props
    //
    cmdText: string = null;
    cmdHint: string = 'Type commands here i.e. /login someBadassNick';
    chatItems: ChatItem[] = [];

    private log: Logger;
    private currentRoom = null;

    constructor(
        private cli: ChatCliService,
        private chat: ChatService,
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
            this.cmdText = null; // reset the cmd line text
        } else if (this.isTab(event)) {
            this.onAutoCompleteCommand(this.cmdText);
            event.stopPropagation();
        }
    }

    ngOnInit() {
        this.chat.feeds().subscribe((msg: Message) => {
            this.onFeed(msg);
        });
    }

    // 
    // Internal implementation
    // 
    private isCtrlEnter(event: KeyboardEvent) {
        return (event.ctrlKey && event.key == 'Enter');
    }

    private isTab(event: KeyboardEvent) {
        return (event.key == 'Tab');
    }

    private onAutoCompleteCommand(commandText: string) {
        this.log.info('Pressed tab...');
    }

    private onCommandSubmit(text: string) {
        let cmd: CliCommand = this.cli.parse(text);

        if (cmd == null) {
            // if we failed to parse a command, and we have a current room, let's treat it
            // as if the usesr wanted to type /say currentRoom text
            if (this.currentRoom) {
                this.onSayCmd({
                    type: '/say',
                    room: this.currentRoom,
                    msg: text
                });
            } else {
                this.cmdHint = 'No current room, command was unrecognized.';
            }

        } else {
            this.log.info(JSON.stringify(cmd));
            this.cmdHint = JSON.stringify(cmd); // show in the hint (placeholder) the cmd we sent

            switch (cmd.type) {
                case '/join':
                case '/j':
                    this.onJoinChannelCmd(cmd as JoinRoomCliCommand);
                    break;
                case '/leave':
                    this.onLeaveChannelCmd(cmd as LeaveRoomCliCommand);
                    break;
                case '/whisper': 
                case '/w':
                    this.onWhisperOutCmd(cmd as WhisperCliCommand);
                    break
                case '/say':
                case '/s':
                    this.onSayCmd(cmd as SayCliCommand);
                    break;
                case '/login':
                    this.onLoginCmd(cmd as LoginCliCommand);
                    break;
                case '/rooms':
                    this.onListRoomsCmd(cmd as ListRoomsCliCommand);
                    break;

                default: {

                    // unrecognized command
                }
            }
        }
    }

    private onJoinChannelCmd(cmd: JoinRoomCliCommand) {
        this.chat.joinRoom(cmd.room)
        .then((roomInfo: RoomInfo) => {
            this.addChatNoticeItem('you joined [' + roomInfo.room + ']. People in here: ' + roomInfo.people.join(', '));
            this.cmdHint = 'now talking in [' + cmd.room + ']';
            this.currentRoom = cmd.room;   
        }).catch((e: Error) => {
            this.addChatNoticeItem('could not join [' + cmd.room + ']: [' + e.message + ']');
        });
    }
    private onLeaveChannelCmd(cmd: LeaveRoomCliCommand) {
        this.chat.leaveRoom(cmd.room) 
        .then(() => {
            this.addChatNoticeItem('you left [' + cmd.room + ']');
            this.cmdHint = 'no current room for talk, /join on or /say room something';
            this.currentRoom = null

        }).catch((e: Error) => {
            this.addChatNoticeItem('could not leave [' + cmd.room + ']: [' + e.message + ']');
        });
    }

    private onWhisperOutCmd(cmd: WhisperCliCommand) {
        this.chat.whisper(cmd.to, cmd.msg)
        .then(() => {
            this.addChatWhisperOutItem(cmd.to, cmd.msg);
        })
        .catch((e: Error) => {
            this.addChatNoticeItem('could not whisper [' + cmd.to + ']: [' + e.message + ']');
        })
    }

    private onSayCmd(cmd: SayCliCommand) {
        this.chat.say(cmd.room, cmd.msg)
        .then(() => {
            this.cmdHint = 'now talking in [' + cmd.room + ']';
            this.currentRoom = cmd.room;          
        })
        .catch((e: Error) => {
            this.addChatNoticeItem('could not say in room [' + cmd.room + ']: [' + e.message + ']');
        });
    }

    private onLoginCmd(cmd: LoginCliCommand) {
        this.chat.login(cmd.nick)
        .then(() => {
            this.addChatNoticeItem('you are now logged in as [' + cmd.nick + '] have fun, but respect other\'s feelings.');
            this.cmdHint = 'join a room with \'/j room-name\', or list the available rooms with \'/rooms\'';
        })
        .catch((e: Error) => {
            this.addChatNoticeItem('could not log in as [' + cmd.nick + ']: [' + e.message + ']');
        });
    }

    private onListRoomsCmd(cmd: ListRoomsCliCommand) {
        this.chat.listRooms(cmd.filter)
        .then((rooms: string[]) => {
            this.addChatNoticeItem('found [' + rooms.length + '] rooms');
            rooms.forEach((room: string, i: number) => {
                this.addChatNoticeItem(i + '. ' + room);
            });
            this.cmdHint = 'join a room with \'/j room-name\', or list the available rooms with \'/rooms\'';
        })
        .catch((e: Error) => {
            this.addChatNoticeItem('could not perform room listing: [' + e.message + ']');
        });
    }

    private onFeed(msg: Message) {
        switch (msg.type) {
            case 'room-chat-feed':
                this.onRoomChatFeed(msg.payload as RoomChatFeedPayload);
                break;
            case 'people-feed':
                this.onPeopleFeed(msg.payload as PeopleFeedPayload);
                break;
            case 'whisper-feed':
                this.onWhisperFeed(msg.payload as WhisperFeedPayload);
                break;
            default: {
                this.log.warn('Unsupported feed type: [' + msg.type + ']');
            }
        }
    }

    private onRoomChatFeed(payload: RoomChatFeedPayload) {
        let item: RoomTalkItem = {
            type: 'room-talk',
            room: payload.room,
            who: payload.who,
            msg: payload.msg
        }
        this.addChatItem(item);
    }

    private onPeopleFeed(payload: PeopleFeedPayload) {
        let noticeText = payload.who + ' ' + payload.userEvent + ' room ' + payload.room;
        this.addChatNoticeItem(noticeText);
    }

    private onWhisperFeed(payload: WhisperFeedPayload) {
        let item: WhisperInItem = {
            type: 'whisper-in',
            from: payload.from,
            msg: payload.whisper
        }
        this.addChatItem(item);
    }

    private addChatWhisperOutItem(to: string, msg: string) {
        let item: WhisperOutItem = {
            type: 'whisper-out',
            to: to,
            msg: msg
        }
        this.addChatItem(item);
    }

    private addChatNoticeItem(noticeText: string) {
        let item: NoticeItem = {
            type: 'notice',
            text: noticeText
        }
        this.addChatItem(item);
    }

    private addChatItem(item: ChatItem) {
        this.chatItems.push(item);
    }

    private clearChatItems() {
        this.chatItems.splice(0, this.chatItems.length);
    }
}

