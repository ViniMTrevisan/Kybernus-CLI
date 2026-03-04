# 🚀 Deploy to Railway

Your deployment configuration has been generated for **Railway**.

## 📁 Files generated

- `railway.toml` — Railway project configuration

## 🔑 1. Set Environment Variables

1. Go to [railway.app](https://railway.app) → Your Project → **Variables**
2. Add each variable from your `.env` file:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Your database connection string |
| `JWT_SECRET` | A strong, random secret for JWT signing |
| `NODE_ENV` / `PYTHON_ENV` | Set to `production` |

> 💡 Railway can also **provision a Postgres database** for you directly — click **New → Database → Postgres** in your project.

## ⚡ 2. Deploy

**Option A — GitHub Auto-Deploy (recommended):**
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo — Railway auto-detects `railway.toml` and deploys on every push to `main`

**Option B — Railway CLI:**
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## 📖 More Info
- [Railway Docs](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/reference/cli-api)
