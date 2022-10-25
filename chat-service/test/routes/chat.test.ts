import { io as Client, Socket as ClientSocket } from 'socket.io-client'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { assert } from 'chai'
import { ChatSocketHandler } from '../../src/routes/chat/chat.socket'
import {
  ChatSocketEvent,
  ReceiveRoomMessagePayload,
} from '../../src/routes/chat/chat.model'
import { UserServiceClient } from '../../src/clients/user-service/user-service.client'
import {
  UserRole,
  ValidateTokenResponse,
} from '../../src/clients/user-service/user-service.model'

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

describe('chat socket tests', () => {
  let io: Server
  let matchSocket: ChatSocketHandler
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

      matchSocket = new ChatSocketHandler(io, new UserServiceClientMock())
    })
  })

  after(() => {
    io.close()
    client1.close()
    client2.close()
  })

  /**
   * Flow:
   * client 1 join room
   * client 2 join room
   * client 1 -> send chat message to 2
   * client 2 -> receive message, send message to 1
   * client 1 -> receive message, done
   */
  it('should receive chat messages between two clients in the same room', (done) => {
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

    const roomId = '123456'

    const messageFromClient1ToClient2 = 'hello world'
    const messageFromClient2ToClient1 = 'another world'

    client1.emit(ChatSocketEvent.JoinRoom, {
      roomId,
    })
    client2.emit(ChatSocketEvent.JoinRoom, {
      roomId,
    })

    client1.emit(ChatSocketEvent.RoomMessage, {
      roomId,
      message: messageFromClient1ToClient2,
    })

    client2.on(
      ChatSocketEvent.RoomMessage,
      ({ from, message }: ReceiveRoomMessagePayload) => {
        assert(message === messageFromClient1ToClient2)
        assert(from === client1Username)
        client2.emit(ChatSocketEvent.RoomMessage, {
          roomId,
          message: messageFromClient2ToClient1,
        })
      }
    )

    client1.on(
      ChatSocketEvent.RoomMessage,
      ({ from, message }: ReceiveRoomMessagePayload) => {
        assert(message === messageFromClient2ToClient1)
        assert(from === client2Username)
        done()
      }
    )
  })
})
