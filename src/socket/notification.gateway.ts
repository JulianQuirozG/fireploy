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

  /**
  * Map of connected clients indexed by userId.
  */
  private clients = new Map<number, Socket>();

  /**
   * Handles a new client connection.
   * Stores the client socket using the userId from the handshake query.
   *
   * @param {Socket} client - The connected socket client.
   */
  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (!isNaN(userId)) {
      this.clients.set(userId, client);
    }
  }

  /**
   * Handles client disconnection.
   * Removes the client from the map of active clients.
   *
   * @param {Socket} client - The disconnected socket client.
   */
  handleDisconnect(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    this.clients.delete(userId);
  }

  /**
   * Sends a custom notification message to a specific user.
   *
   * @param {number} userId - The ID of the user to send the message to.
   * @param {any} message - The message payload to be sent.
   */
  sendToUser(userId: number, message: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('notificacion', message);
    }
  }

  /**
   * Sends a deploy position update message to a specific user.
   *
   * @param {number} userId - The ID of the user to send the update to.
   * @param {any} message - The update payload to be sent.
   */
  sendUpdateDeployPosition(userId: number, message: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('deploy_position', message);
    }
  }
}
