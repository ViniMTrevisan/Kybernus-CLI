# WebSocket

## Files generated

- `websocket.ts` or `AppGateway.ts` in the root of `src/`

## Install dependencies

### Node.js Express
```bash
npm install ws
npm install -D @types/ws
```

### NestJS (uses socket.io)
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

## Integration

### Node.js Express — update `app.ts` / `index.ts`:
```typescript
import http from 'http';
import app from './app'; // your express app
import { setupWebSocket } from './websocket';

const server = http.createServer(app);
setupWebSocket(server);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
```
> ⚠️ Replace `app.listen(...)` with `server.listen(...)` — WebSocket requires the raw HTTP server.

### NestJS — register the Gateway in your module:
```typescript
import { AppGateway } from './websocket'; // or AppGateway

@Module({
  providers: [AppGateway],
})
export class AppModule {}
```

---

## Testing WebSocket connection

```bash
# Install wscat
npm install -g wscat

# Connect (Express)
wscat -c ws://localhost:3000

# Connect (NestJS / socket.io)
# Use the socket.io client in the browser or:
npm install -g socket.io-client
```
