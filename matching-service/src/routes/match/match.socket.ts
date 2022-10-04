import { Server, Socket } from 'socket.io'
import { v4 } from 'uuid'
import { SocketEvent } from '../../shared/socketio.model'
import { Difficulty } from '../../shared/rooms.model'
import {
  FindMatchPayload,
  FindMatchResult,
  MatchSocketEvent,
  SocketId,
} from './match.model'

export class MatchSocket {
  private io: Server

  private queues: { [key in Difficulty]: SocketId[] }

  constructor(io: Server) {
    this.io = io
    this.queues = {
      Easy: [],
      Medium: [],
      Hard: [],
    }
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

    const newRoomId = v4()
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
  }

  cancelFindMatch(socket: Socket) {
    Object.entries(this.queues).forEach(([key, value]) => {
      this.queues[key as Difficulty] = value.filter((id) => id !== socket.id)
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
    })
  }
}
