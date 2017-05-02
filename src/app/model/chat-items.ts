//
// Types and interfaces of chat items
//
export type ChatItemType = 
    'notice' |         // user joined... user left... user in room...
    'whisper-in' |     // your crush whispers you
    'whisper-out' |    // you whispering to your crush
    'room-talk';       // general room chat, including your own talking in the room

export interface ChatItem {
    type: ChatItemType
}

export interface WhisperInItem extends ChatItem {
    from: string,
    msg: string
}

export interface WhisperOutItem extends ChatItem {
    to: string
    msg: string;
}

export interface RoomTalkItem extends ChatItem {
    room: string,
    who: string,
    msg: string
}

export interface NoticeItem extends ChatItem {
    text: string
}