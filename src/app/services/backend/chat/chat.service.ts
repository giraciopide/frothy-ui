import { Injectable } from '@angular/core';
import { BackendConnectionService } from '../connection/backend-connection.service';
import { ChatCliService } from '../../cmdline/commandline.service';
import { Message } from '../../messages';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class ChatService {

    constructor(
        private cli: ChatCliService,
        private backend: BackendConnectionService) { }


    joinRoom(room: string): Promise<Message> {
        return this.backend.send({
            type: 'join-room-req',
            payload: {
                room: room
            }
        });
    }

    leaveRoom(room: string): Promise<Message> {
        return this.backend.send({
            type: 'leave-room-req',
            payload: {
                room: room
            }
        });
    }

    whisper(to: string, text: string): Promise<Message> {
        return this.backend.send({
            type: 'whisper-req',
            payload: {
                to: to,
                msg: text
            }
        });
    }

    say(room: string, text: string): Promise<Message> {
        return this.backend.send({
            type: 'say-req',
            payload: {
                room: room,
                msg: text           
            }
        });
    }

    login(nick: string): Promise<Message> {
        return this.backend.send({
            type: 'login-req',
            payload: {
                nick: nick
            }
        });
    }

    feeds(): Observable<Message> {
        return this.backend.getFeed();
    }
}
