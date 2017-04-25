/*
 * The Interfaces of the chat protocol messages
 */
 
export interface Message {
	id?: string;
	type: string;
	payload: Payload;
}

export type Payload = LoginRequestPayload | ResponseStatusPayload | WhisperRequestPayload | SayRequestPayload
					| LeaveRoomRequestPayload | JoinRoomRequestPayload | ListRoomsRequestPayload | ListRoomsResponsePayload
					| WhisperFeedPayload | RoomChatFeedPayload | RoomUserFeedPayload;

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

export type RoomUserAction = "JOINED ROOM" | "LEFT ROOM";

export interface RoomUserFeedPayload {
	who: string;
	action: RoomUserAction;
	room: string;
}

