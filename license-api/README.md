# Kybernus License API

API for license validation, trial management, and analytics.

## Quick Start

### 1. Copy environment file
```bash
cp .env.example .env
```

### 2. Start PostgreSQL
```bash
docker-compose up -d
```

### 3. Install dependencies
```bash
npm install
```

### 4. Run Prisma migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start API
```bash
npm run dev
```

API will be available at `http://localhost:3000`

## Endpoints

- `POST /api/auth/register` - Start trial
- `POST /api/licenses/validate` - Validate license
- `POST /api/analytics/track` - Track event
- `POST /api/checkout/create` - Create Stripe checkout
- `POST /webhooks/stripe` - Stripe webhooks
- `GET /admin` - Dashboard (HTML)
- `GET /admin/dashboard` - Dashboard metrics (JSON)

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Prisma Studio (DB GUI)
npm run db:studio
```

## Environment Variables

See `.env.example` for all required variables.
