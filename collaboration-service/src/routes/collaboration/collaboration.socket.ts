import { Server, Socket } from 'socket.io'
import { UserServiceClient } from '../../clients/user-service/user-service.client'
import { SocketEvent } from '../../shared/socketio.model'
import {
  CollaborationSocketEvent,
  LeaveRoomPayload,
  ReceiveRoomMessagePayload,
  RoomIdPayload,
  SendRoomMessagePayload,
  SocketIdPayload,
} from './collaboration.model'
import {
  UserRole,
  ValidateTokenResponse,
} from '../../clients/user-service/user-service.model'

export class CollaborationSocketHandler {
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
      socket.on(CollaborationSocketEvent.JoinRoom, (payload: RoomIdPayload) =>
        this.joinRoom(payload, socket)
      )

      socket.on(
        CollaborationSocketEvent.RoomMessage,
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
    socket.join(roomId)
  }

  leaveAllRooms(socket: Socket) {
    const leaveRoomPayload: LeaveRoomPayload = {
      username: socket.data.username,
    }
    socket.rooms.forEach((room) => {
      socket.to(room).emit(CollaborationSocketEvent.LeaveRoom, leaveRoomPayload)
    })
  }

  async newRoomMessage(
    { message, roomId }: SendRoomMessagePayload,
    sendingSocket: Socket
  ) {
    const roomMessagePayload: ReceiveRoomMessagePayload = {
      from: sendingSocket.data.username,
      message,
    }
    sendingSocket
      .to(roomId)
      .emit(CollaborationSocketEvent.RoomMessage, roomMessagePayload)
  }
}
