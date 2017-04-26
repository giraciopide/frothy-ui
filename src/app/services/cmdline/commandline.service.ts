import { Injectable } from '@angular/core';
import { Message } from '../messages';

export type Command = '/join' | '/j' | '/leave' | '/whisper' | '/w' | '/say' | '/s' | '/login';

@Injectable()
export class ChatCliService {

    constructor() { }

    /**
    * Parse text and returns the correspondent message to be sent to the backend.
    * @returns null if the text is not a valid command and cannot be parsed. 
    */
    parseCommandLine(text: string, currentRoom: string): Message {
        let t = text.trim();
        let message: Message = null;

        if (t.startsWith('/')) {
            let command: Command = this.parseCommand(t);
            switch (command) {
                case '/j':
                case '/join':
                    message = this.parseJoinRoomCmd(t);
                    break;
                case '/leave':
                    message = this.parseLeaveRoomCmd(t);
                    break;
                case '/whisper':
                case '/w':
                    message = this.parseWhisperCmd(t);
                    break;
                case '/say':
                case '/s':
                    message = this.parseSayCmd(t);
                    break;
                case '/login':
                    message = this.parseLoginCmd(t);
                    break;
           
                default: {
                    // do nothing, message will remain null.
                }
            }

        } 
        return message;
    }

    private split(text: string, limit: number): string[] {
        return text.split(/(\s+)/, limit);
    }

    private parseCommand(text: string): Command {
        let pieces = this.split(text, 2);
        return pieces[0] as Command;
    }

    /**
     * Parses comd like: /join room_name
     */
    private parseJoinRoomCmd(t: string): Message {
        let p = this.split(t, 2 + 1);
        let roomName = p[1];
        return {
            type: 'join-room-req',
            payload: {
                room: roomName
            }
        };
    }

    /**
     * Parses comd like: /leave room_name
     */
    private parseLeaveRoomCmd(t: string): Message {
        let p = this.split(t, 2 + 1);
        let roomName = p[1];
        return {
            type: 'leave-room-req',
            payload: {
                room: roomName
            }
        };
    }

    /**
     * Parses comd like: /w my_secret_crush I love you!
     */
    private parseWhisperCmd(t: string): Message {
        let p = this.split(t, 2 + 1);
        let to = p[1];
        let whisper = p[2];
        return {
            type: 'whisper-req',
            payload: {
                to: to,
                msg: whisper            
            }
        };
    }

    /**
     * Parses cmd like: /say room-name Hello chaps!
     */
    private parseSayCmd(t: string): Message {
        let p = this.split(t, 2 + 1);
        let room = p[1];
        let msg = p[2];
        return {
            type: 'say-req',
            payload: {
                room: room,
                msg: msg           
            }
        };
    }

    /**
     * Parses cmd like: /login badassNickNameOfDeath
     */
    private parseLoginCmd(t: string): Message {
        let p = this.split(t, 2 + 1);
        let nick = p[1];
        return {
            type: 'login-req',
            payload: {
                nick: nick     
            }
        };
    }
}
