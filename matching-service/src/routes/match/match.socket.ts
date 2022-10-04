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
import {
  UserRole,
  ValidateTokenResponse,
} from '../../clients/user-service/user-service.model'
import { UserServiceClient } from '../../clients/user-service/user-service.client'

export class MatchSocket {
  private io: Server
  private userServiceClient: UserServiceClient

  private queues: { [key in Difficulty]: SocketId[] }

  constructor(io: Server, userServiceClient: UserServiceClient) {
    this.io = io
    this.queues = {
      Easy: [],
      Medium: [],
      Hard: [],
    }
    this.userServiceClient = userServiceClient
    this.start()
  }

  start() {
    this.attachAuthMiddleware()
    this.startHandler()
  }

  async attachAuthMiddleware() {
    this.io.use(async (socket, next) => {
      const token = socket.request.headers.authorization

      if (token === undefined) return next(new Error('Authentication error'))

      const response: ValidateTokenResponse =
        await this.userServiceClient.validateAccessTokenAndRole(
          token,
          UserRole.User
        )

      if (response.error)
        return next(new Error(`Error validating token: ${response.error}`))

      socket.data.username = response.username

      return next()
    })
  }

  startHandler() {
    this.io.on(SocketEvent.Connection, (socket) => {
      socket.on(MatchSocketEvent.FindMatch, async (payload: FindMatchPayload) =>
        this.findMatch(payload, socket)
      )

      socket.on(MatchSocketEvent.CancelFindMatch, () =>
        this.cancelFindMatch(socket)
      )
    })
  }

  async findMatch({ difficulty }: FindMatchPayload, socket: Socket) {
    const queue = this.queues[difficulty]

    // if queue empty, return false for match for now
    if (queue.length === 0) {
      queue.push(socket.data.username)
      return
    }

    // ignore since guaranteed non-empty queue even though technically shift() can
    // return undefined, but in this case we are sure it's not empty
    // @ts-ignore
    const otherSocketUsername: string = queue.shift()

    const newRoomId = v4()
    const currSocketPayload: FindMatchResult = {
      roomId: newRoomId,
      otherUser: otherSocketUsername,
    }
    socket.emit(MatchSocketEvent.MatchFound, currSocketPayload)

    const otherSocketPayload: FindMatchResult = {
      roomId: newRoomId,
      otherUser: socket.data.username,
    }
    socket
      .to(otherSocketUsername)
      .emit(MatchSocketEvent.MatchFound, otherSocketPayload)
  }

  cancelFindMatch(socket: Socket) {
    Object.entries(this.queues).forEach(([key, value]) => {
      this.queues[key as Difficulty] = value.filter(
        (username) => username !== socket.data.username
      )
    })
  }
}
