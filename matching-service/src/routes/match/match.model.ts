import { Difficulty } from '../../mongo/rooms/rooms.model'

export class MatchError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export type SocketId = string
export type RoomId = string

export type FindMatchPayload = {
  difficulty: Difficulty
}

export type FindMatchResult = {
  message?: string
  roomId: RoomId
  otherUser: SocketId
}

export type LeaveRoomPayload = {
  roomId: RoomId
}

export type LeftRoomPayload = {
  socketId: SocketId
}

export type SendRoomMessagePayload = {
  roomId: RoomId
  message: string
}

export type ReceiveRoomMessagePayload = {
  from: SocketId
  message: string
}

export type MatchSuccess = {
  success: true
  roomId: RoomId
}

export type MatchFailure = {
  success: false
  message: string
}

export enum MatchSocketEvent {
  Connection = 'connection',

  // match events
  FindMatch = 'find_match',
  MatchFound = 'match_found',
  CancelFindMatch = 'cancel_find_match',

  // leaving room events
  LeaveRoom = 'leave_room',
  LeftRoom = 'left_room',

  // receiving message events
  RoomMessage = 'room_message',
}
