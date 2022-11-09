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
import { Logger } from '../../utils/logger'
import { QuestionServiceClient } from '../../clients/question-service/question-service.client'

export class MatchSocket {
  private io: Server
  private userServiceClient: UserServiceClient
  private questionServiceClient: QuestionServiceClient

  public queues: { [key in Difficulty]: SocketId[] }
  public usernameToLastSocketId: Record<string, string>

  constructor(
    io: Server,
    userServiceClient: UserServiceClient,
    questionServiceClient: QuestionServiceClient
  ) {
    this.io = io
    this.queues = {
      Easy: [],
      Medium: [],
      Hard: [],
    }
    this.usernameToLastSocketId = {}
    this.userServiceClient = userServiceClient
    this.questionServiceClient = questionServiceClient
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
      this.usernameToLastSocketId[socket.data.username] = socket.id

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
    Logger.info(
      `Reveived new find match for difficulty: ${difficulty}, from socket: ${socket.id}`
    )

    // if queue empty, return false for match for now
    if (queue.length === 0) {
      queue.push(socket.data.username)
      return
    }

    // ignore since guaranteed non-empty queue even though technically shift() can
    // return undefined, but in this case we are sure it's not empty
    // @ts-ignore
    const otherSocketUsername: string = queue.shift()
    const otherSocketId = this.usernameToLastSocketId[otherSocketUsername]
    delete this.usernameToLastSocketId[otherSocketUsername]
    const newRoomId = v4()

    Logger.info(
      `Match found between socket: ${socket.id} and ${otherSocketUsername}, sending to room: ${newRoomId}`
    )

    try {
      const token = socket.request.headers.authorization
      if (token === undefined) throw Error('Unable to get token from socket')

      Logger.info(
        `Retrieving questions from question service`
      )

      const { data: questions } =
        await this.questionServiceClient.getQuestionPairByDifficulty(
          token,
          difficulty
        )
      
      Logger.info(
        `Retrieved questions from question service`
      )

      const currSocketPayload: FindMatchResult = {
        roomId: newRoomId,
        difficulty,
        questions,
      }
      socket.emit(MatchSocketEvent.MatchFound, currSocketPayload)

      Logger.info(
        `emitted`
      )

      const otherSocketPayload: FindMatchResult = {
        roomId: newRoomId,
        difficulty,
        questions,
      }
      socket
        .to(otherSocketId)
        .emit(MatchSocketEvent.MatchFound, otherSocketPayload)

      Logger.info(
        `emitted to other`
      )
    } catch (e) {
      Logger.error(`Error occurred when trying to match sockets: ${e}`)
    }
  }

  cancelFindMatch(socket: Socket) {
    Logger.info(`Received cancel from user: ${socket.data.username}`)
    Object.entries(this.queues).forEach(([key, value]) => {
      this.queues[key as Difficulty] = value.filter(
        (socketUsername) => socketUsername !== socket.data.username
      )
    })
  }
}
