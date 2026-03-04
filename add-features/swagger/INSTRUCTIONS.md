# Swagger / OpenAPI

## Files generated

- `swagger.ts` or `swagger.py` in the root of `src/`

## Install dependencies

### Node.js Express
```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

### NestJS
```bash
npm install @nestjs/swagger
```

### Python FastAPI
> FastAPI has OpenAPI/Swagger built-in — no extra packages needed!

---

## Integration

### Node.js Express — add to `app.ts`:
```typescript
import { setupSwagger } from './swagger';
// after app is created:
setupSwagger(app);
```

### NestJS — add to `main.ts`:
```typescript
import { setupSwagger } from './swagger';
// after app is created, before app.listen():
setupSwagger(app);
```

### Python FastAPI — add to `main.py`:
```python
from swagger import configure_swagger
configure_swagger(app)
```

---

## Docs URL

After starting the server, open:
- **Express / NestJS:** `http://localhost:3000/api/docs`
- **FastAPI:** `http://localhost:8000/api/docs`
