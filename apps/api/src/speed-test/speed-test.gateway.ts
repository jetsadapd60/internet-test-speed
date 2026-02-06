import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({ path: '/ping' })
export class SpeedTestGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: WebSocket) {
    client.on('message', (message: Buffer) => {
      // Raw echo back
      client.send(message.toString());
    });
  }

  handleDisconnect() {
    // Cleanup if needed
  }
}
