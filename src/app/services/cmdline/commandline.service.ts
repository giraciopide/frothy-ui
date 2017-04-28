import { Injectable } from '@angular/core';
import { Message } from '../messages';
import { LoggingService, Logger } from '../logging/logging.service';

export type Command = '/join' | '/j' | '/leave' | '/whisper' | '/w' | '/say' | '/s' | '/login';

export interface CliCommand {
    type: Command    
}

export interface LoginCliCommand extends CliCommand {
    nick: string;
}

export interface JoinRoomCliCommand extends CliCommand {
    room: string;
}

export interface LeaveRoomCliCommand extends CliCommand {
    room: string;
}

export interface WhisperCliCommand extends CliCommand {
    to: string;
    msg: string;
}

export interface SayCliCommand extends CliCommand {
    room: string;
    msg: string;
}

@Injectable()
export class ChatCliService {

    private log: Logger;

    constructor(logFactory: LoggingService) { 
        this.log = logFactory.getLogger('chat-cli-service');
    }

    /**
    * Parse text and returns the correspondent message to be sent to the backend.
    * @returns null if the text is not a valid command and cannot be parsed. 
    */
    parse(text: string, currentRoom?: string): CliCommand {
        let t = text.trim();
        let cliCmd: CliCommand = null;

        if (t.startsWith('/')) {
            let command: Command = this.parseCommand(t);
            switch (command) {
                case '/j':
                case '/join':
                    cliCmd = this.parseJoinRoomCmd(t);
                    break;
                case '/leave':
                    cliCmd = this.parseLeaveRoomCmd(t);
                    break;
                case '/whisper':
                case '/w':
                    cliCmd = this.parseWhisperCmd(t);
                    break;
                case '/say':
                case '/s':
                    cliCmd = this.parseSayCmd(t);
                    break;
                case '/login':
                    cliCmd = this.parseLoginCmd(t);
                    break;
           
                default: {
                    // do nothing, message will remain null.
                }
            }

        } 
        return cliCmd;
    }

    // split('a b c d', 2 ) should return ['a', 'b', 'c d']
    private split(text: string, limit: number): string[] {
        // we split on limit - 1
        let head: string[] = text.split(/\s+/, limit - 1);
        let lastHeadToken = head[head.length - 1];
        let headLastChar = text.indexOf(lastHeadToken) + lastHeadToken.length;
        let tail = text.substring(headLastChar).trim(); // trim is important here.
        // let's just reuse head to return the pieces
        head.push(tail);
        return head;
    }

    private parseCommand(text: string): Command {
        let pieces = this.split(text, 2);
        this.log.info(JSON.stringify(pieces));
        return pieces[0] as Command;
    }

    /**
     * Parses comd like: /join room_name
     */
    private parseJoinRoomCmd(t: string): JoinRoomCliCommand {
        let p = this.split(t, 2 + 1);
        this.log.info(JSON.stringify(p));
        let roomName = p[1];
        return {
            type: '/join',
            room: roomName
        }
    }

    /**
     * Parses comd like: /leave room_name
     */
    private parseLeaveRoomCmd(t: string): LeaveRoomCliCommand {
        let p = this.split(t, 2 + 1);
        this.log.info(JSON.stringify(p));
        let roomName = p[1];
        return {
            type: '/leave',
            room: roomName
        }
    }

    /**
     * Parses comd like: /w my_secret_crush I love you!
     */
    private parseWhisperCmd(t: string): WhisperCliCommand {
        let p = this.split(t, 2 + 1);
        this.log.info(JSON.stringify(p));
        let to = p[1];
        let whisper = p[2];
        return {
            type: '/whisper',
            to: to,
            msg: whisper
        }
    }

    /**
     * Parses cmd like: /say room-name Hello chaps!
     */
    private parseSayCmd(t: string): SayCliCommand {
        let p = this.split(t, 2 + 1);
        this.log.info(JSON.stringify(p));
        let room = p[1];
        let msg = p[2];
        return {
            type: '/say',
            room: room,
            msg: msg
        }
    }

    /**
     * Parses cmd like: /login badassNickNameOfDeath
     */
    private parseLoginCmd(t: string): LoginCliCommand {
        let p = this.split(t, 2 + 1);
        this.log.info(JSON.stringify(p));
        let nick = p[1];
        return {
            type: '/login',
            nick: nick
        }
    }

    //
    // To message
    //
    // 
    //
    //

    public static asMessage(cmd: CliCommand): Message {
        switch (cmd.type) {

            case '/join':
            case '/j': {
                let c = cmd as JoinRoomCliCommand;
                return {
                    type: 'join-room-req',
                    payload: {
                        room: c.room
                    }
                };
            }

            case '/leave': {
                let c = cmd as LeaveRoomCliCommand;
                return {
                    type: 'leave-room-req',
                    payload: {
                        room: c.room
                    }
                };
            }

            case '/whisper':
            case '/w': {
                let c = cmd as WhisperCliCommand;
                return {
                    type: 'whisper-req',
                    payload: {
                        to: c.to,
                        msg: c.msg
                    }
                };      
            }

            case '/say':
            case '/s': {
                let c = cmd as SayCliCommand;
                return {
                    type: 'say-req',
                    payload: {
                        room: c.room,
                        msg: c.msg           
                    }
                };
            }
                
            case '/login': {
                let c = cmd as LoginCliCommand;
                return {
                    type: 'login-req',
                    payload: {
                        nick: c.nick     
                    }
                };
            }

            default:
                return null;
        }

    }
}
