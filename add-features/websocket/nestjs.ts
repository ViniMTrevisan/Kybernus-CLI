import {
    WebSocketGateway,
    WebSocketServer as WsServer,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WsServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`🔌 Client connected: ${client.id}`);
        client.emit('connected', { message: 'Welcome!' });
    }

    handleDisconnect(client: Socket) {
        console.log(`🔌 Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: string): void {
        console.log('📨 Received:', data);
        this.server.emit('message', { event: 'echo', data });
    }

    broadcast(event: string, data: unknown): void {
        this.server.emit(event, data);
    }
}
