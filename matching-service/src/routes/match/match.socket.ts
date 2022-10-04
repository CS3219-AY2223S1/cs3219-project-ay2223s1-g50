import { Server, Socket } from 'socket.io'
import { v4 } from 'uuid'
import { SocketEvent } from '../../middleware/socketio/socketio.model'
import { rooms } from '../../mongo/rooms'
import { Difficulty } from '../../mongo/rooms/rooms.model'
import {
  FindMatchPayload,
  FindMatchResult,
  LeaveRoomPayload,
  LeftRoomPayload,
  MatchSocketEvent,
  RoomId,
  SocketId,
} from './match.model'

export class MatchSocket {
  private io: Server

  private queues: { [key in Difficulty]: SocketId[] }
  private rooms: Record<RoomId, SocketId[]>

  constructor(io: Server) {
    this.io = io
    this.queues = {
      Easy: [],
      Medium: [],
      Hard: [],
    }
    this.rooms = {}
    this.start()
  }

  async findMatch({ difficulty }: FindMatchPayload, socket: Socket) {
    const queue = this.queues[difficulty]

    // if queue empty, return false for match for now
    if (queue.length === 0) {
      queue.push(socket.id)
      return
    }

    // ignore since guaranteed non-empty queue even though technically shift() can
    // return undefined, but in this case we are sure it's not empty
    // @ts-ignore
    const otherSocketId: string = queue.shift()

    try {
      const newRoomId = v4()
      const users: [string, string] = [socket.id, otherSocketId]
      const newRoom = {
        _id: newRoomId,
        users,
        difficulty,
      }

      await rooms.create(newRoom)
      this.rooms[newRoomId] = users

      const currSocketPayload: FindMatchResult = {
        roomId: newRoomId,
        otherUser: otherSocketId,
      }
      socket.emit(MatchSocketEvent.MatchFound, currSocketPayload)

      const otherSocketPayload: FindMatchResult = {
        roomId: newRoomId,
        otherUser: socket.id,
      }
      socket
        .to(otherSocketId)
        .emit(MatchSocketEvent.MatchFound, otherSocketPayload)
    } catch (e) {
      throw new Error(`Unknown error: ${e}`)
    }
  }

  cancelFindMatch(socket: Socket) {
    Object.entries(this.queues).forEach(([key, value]) => {
      this.queues[key as Difficulty] = value.filter((id) => id !== socket.id)
    })
  }

  leaveRoom({ roomId }: LeaveRoomPayload, socket: Socket) {
    this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== socket.id)

    const payload: LeftRoomPayload = { socketId: socket.id }
    // tell other sockets that current socket has left room
    this.rooms[roomId].forEach((other) => {
      socket.to(other).emit(MatchSocketEvent.LeftRoom, payload)
    })
  }

  start() {
    this.io.on(SocketEvent.Connection, (socket) => {
      socket.on(MatchSocketEvent.FindMatch, async (payload: FindMatchPayload) =>
        this.findMatch(payload, socket)
      )

      socket.on(MatchSocketEvent.CancelFindMatch, () =>
        this.cancelFindMatch(socket)
      )

      socket.on(MatchSocketEvent.LeaveRoom, (payload: LeaveRoomPayload) => {
        this.leaveRoom(payload, socket)
      })
    })
  }
}
