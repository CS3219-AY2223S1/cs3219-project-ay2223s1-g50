export class MatchError extends Error {
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

export enum CollaborationSocketEvent {
  // receiving message events
  RoomMessage = 'collaboration:room_message',

  // joining a matched room
  JoinRoom = 'collaboration:join_room',
  LeaveRoom = 'collaboration:leave_room',
}
