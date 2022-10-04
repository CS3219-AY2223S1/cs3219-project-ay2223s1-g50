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

describe('match socket tests', () => {
  let io: Server
  let matchSocket: MatchSocket
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

      matchSocket = new MatchSocket(io)
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
    // @ts-ignore
    client1 = new Client(address)
    // @ts-ignore
    client2 = new Client(address)

    const easyDifficultyPayload: FindMatchPayload = {
      difficulty: Difficulty.Easy,
    }

    client1.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)
    client2.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)

    client1.on(MatchSocketEvent.MatchFound, (result: FindMatchResult) => {
      assert(result.otherUser === client2.id)
    })

    client2.on(MatchSocketEvent.MatchFound, (result: FindMatchResult) => {
      assert(result.otherUser === client1.id)
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
    // @ts-ignore
    client1 = new Client(address)
    // @ts-ignore
    client2 = new Client(address)

    const easyDifficultyPayload: FindMatchPayload = {
      difficulty: Difficulty.Easy,
    }

    client1.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)
    client1.emit(MatchSocketEvent.CancelFindMatch)
    client2.emit(MatchSocketEvent.FindMatch, easyDifficultyPayload)

    io.on(SocketEvent.Connection, (socket) => {
      socket.on(MatchSocketEvent.CancelFindMatch, () => {
        assert(socket.id === client1.id)
        done()
      })
    })
  })
})
