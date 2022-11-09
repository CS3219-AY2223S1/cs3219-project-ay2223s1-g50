export class ChatError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export type SocketId = string
export type RoomId = string

export type RoomIdPayload = {
  roomId: RoomId
}

export type SocketIdPayload = {
  socketId: SocketId
}

export type LeaveRoomPayload = {
  username: string
}

export type SendRoomMessagePayload = {
  roomId: RoomId
  message: string
}

export type ReceiveRoomMessagePayload = {
  from: SocketId
  message: string
}

export enum ChatSocketEvent {
  // receiving message events
  RoomMessage = 'chat:room_message',

  // joining a matched room
  JoinRoom = 'chat:join_room',
  LeaveRoom = 'chat:leave_room',
}
