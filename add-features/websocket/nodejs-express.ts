import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer;

export function setupWebSocket(server: Server): void {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('🔌 WebSocket client connected');

        ws.on('message', (data) => {
            const message = data.toString();
            console.log('📨 Received:', message);

            // Echo back to sender
            ws.send(JSON.stringify({ event: 'echo', data: message }));
        });

        ws.on('close', () => {
            console.log('🔌 WebSocket client disconnected');
        });

        ws.send(JSON.stringify({ event: 'connected', data: 'Welcome!' }));
    });

    console.log('🔌 WebSocket server ready');
}

export function broadcast(event: string, data: unknown): void {
    if (!wss) return;
    const payload = JSON.stringify({ event, data });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}
