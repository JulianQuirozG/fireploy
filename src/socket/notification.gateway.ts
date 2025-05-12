import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients = new Map<number, Socket>();

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (!isNaN(userId)) {
      this.clients.set(userId, client);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    this.clients.delete(userId);
  }

  sendToUser(userId: number, message: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('notificacion', message);
    }
  }
}
