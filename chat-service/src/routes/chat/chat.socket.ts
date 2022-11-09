import { Server, Socket } from 'socket.io'
import { UserServiceClient } from '../../clients/user-service/user-service.client'
import { SocketEvent } from '../../shared/socketio.model'
import {
  ChatSocketEvent,
  LeaveRoomPayload,
  ReceiveRoomMessagePayload,
  RoomIdPayload,
  SendRoomMessagePayload,
  SocketIdPayload,
} from './chat.model'
import {
  UserRole,
  ValidateTokenResponse,
} from '../../clients/user-service/user-service.model'
import { Logger } from '../../utils/logger'

export class ChatSocketHandler {
  private io: Server
  private userServiceClient: UserServiceClient

  constructor(io: Server, userServiceClient: UserServiceClient) {
    this.io = io
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

      let { error, username }: ValidateTokenResponse =
        await this.userServiceClient.validateAccessTokenAndRole(
          token,
          UserRole.User
        )

      if (error) return next(new Error(`Error validating token: ${error}`))

      socket.data.username = username

      return next()
    })
  }

  startHandler() {
    this.io.on(SocketEvent.Connection, (socket) => {
      socket.onAny((event: any, ...args: any[]) => {
        Logger.info(`Received event: ${event}`, args)
      })

      socket.on(ChatSocketEvent.JoinRoom, (payload: RoomIdPayload) =>
        this.joinRoom(payload, socket)
      )

      socket.on(
        ChatSocketEvent.RoomMessage,
        async (roomMessagePayload: SendRoomMessagePayload) =>
          this.newRoomMessage(roomMessagePayload, socket)
      )

      socket.on(SocketEvent.Disconnecting, () => {
        this.leaveAllRooms(socket)
      })

      socket.on(SocketEvent.Disconnect, () => {
        // disconnecting from rooms happen automatically
      })
    })
  }

  joinRoom({ roomId }: RoomIdPayload, socket: Socket) {
    Logger.info(`User: ${socket.data.username}, joined room: ${roomId}`)
    socket.join(roomId)
  }

  leaveAllRooms(socket: Socket) {
    Logger.info(
      `User ${socket.data.username} leaving room, emitting leave room to all rooms`
    )
    const leaveRoomPayload: LeaveRoomPayload = {
      username: socket.data.username,
    }
    socket.rooms.forEach((room) => {
      socket.to(room).emit(ChatSocketEvent.LeaveRoom, leaveRoomPayload)
    })
  }

  async newRoomMessage(
    { message, roomId }: SendRoomMessagePayload,
    socket: Socket
  ) {
    const roomMessagePayload: ReceiveRoomMessagePayload = {
      from: socket.data.username,
      message,
    }
    socket.to(roomId).emit(ChatSocketEvent.RoomMessage, roomMessagePayload)

    Logger.info(
      `Received new message, emitting to room: ${roomId}`,
      roomMessagePayload
    )
  }
}
