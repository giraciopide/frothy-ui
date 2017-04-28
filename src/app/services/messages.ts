/*
 * The Interfaces of the chat protocol messages
 */

export type MessageType = 
	'login-req' | 'list-rooms-req' | 'join-room-req' | 'leave-room-req' | 'say-req' | 'whisper-req' | 
	'login-res' | 'list-rooms-res' | 'join-room-res' | 'leave-room-res' | 'say-res' | 'whisper-res' |
	'room-chat-feed' | 'people-feed' | 'whisper-feed';

export type MessageCategory = 'request' | 'response' | 'feed' | 'unknown';

export class Messages {
	public static category(message: Message): MessageCategory {
		let chunks: string[] = message.type.split('-');
		let suffix = chunks[chunks.length - 1];
		switch (suffix) {
			case 'req':
				return 'request';
			case 'res':
				return 'response';
			case 'feed':
				return 'feed';
			default:
				return 'unknown';
		}
	}
}

export interface Message {
	id?: string;
	type: MessageType;
	payload: Payload;
}

export type Payload = LoginRequestPayload | WhisperRequestPayload | SayRequestPayload| LeaveRoomRequestPayload | JoinRoomRequestPayload | ListRoomsRequestPayload 
					| ResponsePayload | ListRoomsResponsePayload | JoinRoomResponsePayload
					| WhisperFeedPayload | RoomChatFeedPayload | PeopleFeedPayload;

//
// Reqs
// 
export interface WhisperRequestPayload {
	to: string;
	msg: string;
}

export interface SayRequestPayload {
	room: string;
	msg: string;
}

export interface LeaveRoomRequestPayload {
	room: string;
}

export interface JoinRoomRequestPayload {
	room: string;	
}

export interface ListRoomsRequestPayload {
}

export interface LoginRequestPayload {
	nick: string;
}

//
// Responses
//
export type ResponseStatus = "OK" | "KO";

export interface ResponsePayload {
	status: ResponseStatus;
	why?: string;
}

export interface ListRoomsResponsePayload extends ResponsePayload {
	rooms: string[];
}

export interface JoinRoomResponsePayload extends ResponsePayload {
	room: string;
	people: string[];
}

//
// Feed payloads
// 

export interface WhisperFeedPayload {
	from: string;
	whisper: string;
}

export interface RoomChatFeedPayload {
	who: string;
    msg: string;
    room: string;
}

export type PeopleAction = "JOINED ROOM" | "LEFT ROOM";

export interface PeopleFeedPayload {
	who: string;
	action: PeopleAction;
	room: string;
}
