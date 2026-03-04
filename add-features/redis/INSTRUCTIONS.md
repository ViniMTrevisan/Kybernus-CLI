# Redis Cache

## Files generated

- `redis.ts` or `redis.py` in the root of `src/`
- `docker-compose.snippet.yml` — add the `redis` service to your existing `docker-compose.yml`
- `.env.snippet` — add `REDIS_URL` to your `.env`

## Install dependencies

### Node.js (Express or NestJS)
```bash
npm install redis
npm install -D @types/redis
```

### Python FastAPI
```bash
pip install redis[asyncio]
```

---

## Integration

### Node.js Express — add to `app.ts` / `index.ts`:
```typescript
import { connectRedis } from './redis';

// Before starting the server:
await connectRedis();
```

### NestJS — add to `app.module.ts`:
```typescript
// Option 1: Use the redis.ts file as a custom provider
// Option 2: Use @nestjs-modules/ioredis or nestjs-redis packages

import { connectRedis } from './redis';

// In bootstrap():
await connectRedis();
```

### Python FastAPI — add to `main.py`:
```python
from redis import connect_redis, disconnect_redis

@app.on_event("startup")
async def startup():
    await connect_redis()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_redis()
```

---

## docker-compose

Add the redis service block from `docker-compose.snippet.yml` to your existing `docker-compose.yml` under `services:`.

Also make sure to merge the `redis_data` volume under the top-level `volumes:` key.
