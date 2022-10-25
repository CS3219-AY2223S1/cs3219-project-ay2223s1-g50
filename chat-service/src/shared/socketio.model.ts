export enum SocketEvent {
  // Lifecycle events
  Connection = 'connection',
  Disconnect = 'disconnect',
  ConnectionError = 'connection_error',
  Disconnecting = 'disconnecting',

  // Socket room events
  CreateRoom = 'create-room',
  DeleteRoom = 'delete-room',
  JoinRoom = 'join-room',
  LeaveRoom = 'leave-room',
}
