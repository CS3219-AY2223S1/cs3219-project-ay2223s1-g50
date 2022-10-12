import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { assert } from 'chai'
import { MatchSocket } from '../../src/routes/match/match.socket'
import {
  FindMatchResult,
  FindMatchPayload,
  LeftRoomPayload,
  MatchSocketEvent,
} from '../../src/routes/match/match.model'
import { Difficulty } from '../../src/shared/rooms.model'
import { SocketEvent } from '../../src/shared/socketio.model'
import { UserServiceClient } from '../../src/clients/user-service/user-service.client'
import {
  UserRole,
  ValidateTokenResponse,
} from '../../src/clients/user-service/user-service.model'
import { QuestionServiceClient } from '../../src/clients/question-service/question-service.client'
import { QuestionPairResponse } from '../../src/clients/question-service/question-service.model'

class UserServiceClientMock extends UserServiceClient {
  async validateAccessTokenAndRole(
    username: string,
    role: UserRole
  ): Promise<ValidateTokenResponse> {
    return {
      success: 'successful',
      username,
    }
  }
}

class QuestionServiceClientMock extends QuestionServiceClient {
  async getQuestionPairByDifficulty(
    token: string,
    difficulty: Difficulty
  ): Promise<QuestionPairResponse> {
    return {
      success: 'yes',
      questionOne: ['hello world'],
      questionTwo: ['another world'],
    }
  }
}

describe('match socket tests', () => {
  let io: Server
  let port
  let address: string
  let client1: ClientSocket
  let client2: ClientSocket

  before(() => {
    const httpServer = createServer()
    if (!httpServer) throw new Error('Error, httpServer not initalized')

    io = new Server(httpServer)

    httpServer.listen(() => {
      // @ts-ignore
      port = httpServer.address().port
      address = `http://localhost:${port}`

      new MatchSocket(
        io,
        new UserServiceClientMock(),
        new QuestionServiceClientMock()
      )
    })
  })

  after(() => {
    io.close()
    client1.close()
    client2.close()
  })

  /**
   * Flow:
   * client 1, 2 -> find match
   * client 1, 2 -> match found, done
   */
  it('should match two client sockets', (done) => {
    const client1Username = 'helloworld'
    // @ts-ignore
    client1 = new Client(address, {
      extraHeaders: {
        Authorization: client1Username,
      },
    })
    const client2Username = 'anotherworld'
    // @ts-ignore
    client2 = new Client(address, {
      extraHeaders: {
        Authorization: client2Username,
      },
    })

    let roomId: string

    const easyDifficultyPayload: FindMatchPayload = {
      difficulty: Difficulty.Easy,
    }

    client1.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)
    client2.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)

    client1.on(MatchSocketEvent.MatchFound, (result: FindMatchResult) => {
      if (roomId === undefined) {
        roomId = result.roomId
      }
      assert(result.difficulty === Difficulty.Easy)
      assert(result.roomId == roomId)
      assert(result.questions.questionOne.includes('hello world'))
      assert(result.questions.questionTwo.includes('another world'))
    })

    client2.on(MatchSocketEvent.MatchFound, (result: FindMatchResult) => {
      assert(result.difficulty === Difficulty.Easy)
      assert(result.roomId == roomId)
      assert(result.questions.questionOne.includes('hello world'))
      assert(result.questions.questionTwo.includes('another world'))
      done()
    })
  })

  /**
   * Flow:
   * Client 1 -> find match
   * Client 1 -> cancel
   * Client 2 -> find match
   * Server -> receive cancel, done
   */
  it('should allow user to cancel looking for room', (done) => {
    const client1Username = 'helloworld'
    // @ts-ignore
    client1 = new Client(address, {
      extraHeaders: {
        Authorization: client1Username,
      },
    })
    const client2Username = 'anotherworld'
    // @ts-ignore
    client2 = new Client(address, {
      extraHeaders: {
        Authorization: client2Username,
      },
    })

    const easyDifficultyPayload: FindMatchPayload = {
      difficulty: Difficulty.Easy,
    }

    client1.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)
    client1.emit(MatchSocketEvent.CancelFindMatch)
    client2.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)

    io.on(SocketEvent.Connection, (socket) => {
      socket.on(MatchSocketEvent.CancelFindMatch, () => {
        assert(socket.id === client1.id)
        assert(socket.data.username === client1Username)
        done()
      })
    })
  })
})
