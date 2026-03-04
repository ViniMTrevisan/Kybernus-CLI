# 🚀 Deploy to Vercel

Your deployment configuration has been generated for **Vercel**.

## 📁 Files generated

- `vercel.json` — Vercel project configuration

## 🔑 1. Set Environment Variables

Before deploying, configure your environment variables in the **Vercel Dashboard**:

1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings → Environment Variables**
2. Add each variable from your `.env` file:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Your database connection string |
| `JWT_SECRET` | A strong, random secret for JWT signing |
| `NODE_ENV` | Set to `production` |

> 💡 Generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## ⚡ 2. Deploy

**Option A — GitHub Auto-Deploy (recommended):**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Vercel auto-detects the framework and deploys on every push to `main`

**Option B — Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📖 More Info
- [Vercel Docs](https://vercel.com/docs)
- [Environment Variables on Vercel](https://vercel.com/docs/environment-variables)
