# Vercel Configuration for Next.js App

## 🎯 Root Directory
**CRÍTICO**: Configure `apps/web` como Root Directory na Vercel Dashboard

## 🔧 Build Settings

### Framework Preset
- Next.js

### Build Command
```bash
npm run build
```

### Output Directory
```
.next
```

### Install Command
```bash
npm install
```

## 🌍 Environment Variables

Adicione no Vercel Dashboard (Settings → Environment Variables):

### Database
```
DATABASE_URL="postgresql://user:pass@host:5432/kybernus"
```

### Authentication
```
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="admin@kybernus.io"
ADMIN_PASSWORD="strong-admin-password"
```

### Stripe
```
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_PRO="price_..."
```

### Email (Resend)
```
RESEND_API_KEY="re_..."
```

### Redis (Upstash)
```
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### Application
```
NEXT_PUBLIC_APP_URL="https://kybernus.vercel.app"
```

## 🚀 Deploy

### Automatic
Vercel auto-deploys on push to `main` branch

### Manual
Use Vercel CLI:
```bash
npm i -g vercel
cd apps/web
vercel --prod
```

## ⚠️ Important Notes

1. **Database Migration**: Run Prisma migrations after first deploy
   ```bash
   npx prisma migrate deploy
   ```

2. **Stripe Webhooks**: Update webhook URL in Stripe Dashboard
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```

3. **Domain**: Configure custom domain in Vercel Dashboard (optional)
