import { Injectable } from '@angular/core';
import { BackendConnectionService } from '../connection/backend-connection.service';
import { ChatCliService } from '../../cmdline/commandline.service';
import { Message, JoinRoomResponsePayload } from '../../messages';
import { Observable } from 'rxjs/Observable';

export interface RoomInfo {
    room: string,
    people: string[]
}

@Injectable()
export class ChatService {

    constructor(
        private cli: ChatCliService,
        private backend: BackendConnectionService) { }


    joinRoom(room: string): Promise<RoomInfo> {
        return this.backend.send({
            type: 'join-room-req',
            payload: {
                room: room
            }
        }).then((msg: Message) => {
            let p = msg.payload as JoinRoomResponsePayload;
            return Promise.resolve({
                room: p.room,
                people: p.people
            });
        });
    } 

    leaveRoom(room: string): Promise<void> {
        return this.backend.send({
            type: 'leave-room-req',
            payload: {
                room: room
            }
        }).then((m: Message) => {
            return Promise.resolve();
        });
    }

    whisper(to: string, text: string): Promise<void> {
        return this.backend.send({
            type: 'whisper-req',
            payload: {
                to: to,
                msg: text
            }
        }).then((m: Message) => {
            return Promise.resolve();
        });
    }

    say(room: string, text: string): Promise<void> {
        return this.backend.send({
            type: 'say-req',
            payload: {
                room: room,
                msg: text           
            }
        }).then((m: Message) => {
            return Promise.resolve();
        });
    }

    login(nick: string): Promise<void> {
        return this.backend.send({
            type: 'login-req',
            payload: {
                nick: nick
            }
        }).then((m: Message) => {
            return Promise.resolve();
        });
    }

    feeds(): Observable<Message> {
        return this.backend.getFeed();
    }
}
