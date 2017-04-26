/*
 * The Interfaces of the chat protocol messages
 */

export type MessageType = 
	'login-req' | 'list-rooms-req' | 'join-room-req' | 'leave-room-req' | 'say-req' | 'whisper-req' | 
	'login-res' | 'list-rooms-res' | 'join-room-res' | 'leave-room-res' | 'say-res' | 'whisper-res' |
	'room-chat-feed' | 'people-feed' | 'whisper-feed' | 'ping-req' | 'ping-res';

export interface Message {
	id?: string;
	type: MessageType;
	payload: Payload;
}

export type Payload = LoginRequestPayload | ResponseStatusPayload | WhisperRequestPayload | SayRequestPayload
					| LeaveRoomRequestPayload | JoinRoomRequestPayload | ListRoomsRequestPayload | ListRoomsResponsePayload
					| WhisperFeedPayload | RoomChatFeedPayload | PeopleFeedPayload | PingReqPayload;

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

export interface ListRoomsResponsePayload {
	rooms: string[];
}

export interface LoginRequestPayload {
	nick: string;
}

export type ResponseStatus = "OK" | "KO";

export interface ResponseStatusPayload {
	status: ResponseStatus;
	why?: string;
}

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

export interface PingReqPayload {
}
