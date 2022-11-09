import { Server, Socket } from 'socket.io'
import { UserServiceClient } from '../../clients/user-service/user-service.client'
import { SocketEvent } from '../../shared/socketio.model'
import {
  CollaborationSocketEvent,
  UsernamePayload,
  ReceiveRoomMessagePayload,
  RoomIdPayload,
  SendRoomMessagePayload,
  SocketIdPayload,
  UsersPayload,
} from './collaboration.model'
import {
  UserRole,
  ValidateTokenResponse,
} from '../../clients/user-service/user-service.model'
import { Logger } from '../../utils/logger'

export class CollaborationSocketHandler {
  private io: Server
  private userServiceClient: UserServiceClient
  private roomToUsers: Record<string, string[]>
  private userToRooms: Record<string, string[]>

  constructor(io: Server, userServiceClient: UserServiceClient) {
    this.io = io
    this.userServiceClient = userServiceClient
    this.userToRooms = {}
    this.roomToUsers = {}
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
        this.removeFromRooms(socket)
      })
    })
  }

  removeFromRooms(socket: Socket) {
    const username = socket.data.username
    this.userToRooms[username]?.forEach((room) => {
      const newRoomUsers = this.roomToUsers[room]?.filter(
        (user) => user !== username
      )
      if (newRoomUsers.length === 0) {
        delete this.roomToUsers[room]
      }
      this.roomToUsers[room] = newRoomUsers
    })
    delete this.userToRooms[username]
  }

  joinRoom({ roomId }: RoomIdPayload, socket: Socket) {
    socket.join(roomId)
    const username = socket.data?.username
    this.userToRooms[username] = [...(this.roomToUsers[username] ?? []), roomId]
    this.roomToUsers[roomId] = [
      ...new Set<string>([...(this.roomToUsers[roomId] ?? []), username]),
    ]
    const usersPayload: UsersPayload = {
      users: this.roomToUsers[roomId] ?? [],
    }
    Logger.info(
      `User ${username} joined room: ${roomId}, users: ${JSON.stringify(
        this.roomToUsers[roomId]
      )}, emitting to join room to all sockets`
    )
    socket.nsp.to(roomId).emit(CollaborationSocketEvent.JoinRoom, usersPayload)
  }

  leaveAllRooms(socket: Socket) {
    Logger.info(
      `User ${socket.data.username} leaving room, emitting leave room to all rooms`
    )
    const username = socket.data.username
    this.userToRooms[username]?.forEach((room) => {
      const usersPayload: UsersPayload = {
        users:
          this.roomToUsers[room]?.filter((user) => user !== username) ?? [],
      }
      socket.to(room).emit(CollaborationSocketEvent.LeaveRoom, usersPayload)
    })
  }

  async newRoomMessage(
    { message, roomId }: SendRoomMessagePayload,
    socket: Socket
  ) {
    Logger.info(`New room message from: ${socket.data.username}`)
    const roomMessagePayload: ReceiveRoomMessagePayload = {
      from: socket.data.username,
      message,
    }
    socket
      .to(roomId)
      .emit(CollaborationSocketEvent.RoomMessage, roomMessagePayload)
  }
}
