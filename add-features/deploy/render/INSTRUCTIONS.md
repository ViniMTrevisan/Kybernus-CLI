# 🚀 Deploy to Render

Your deployment configuration has been generated for **Render**.

## 📁 Files generated

- `render.yaml` — Render Blueprint (Infrastructure as Code)

## 🔑 1. Set Environment Variables

The `render.yaml` marks sensitive variables as `sync: false`, meaning you need to set them manually:

1. Go to [dashboard.render.com](https://dashboard.render.com) → Your Service → **Environment**
2. Add each variable:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Your database connection string |
| `JWT_SECRET` | A strong, random secret (auto-generated if `generateValue: true`) |

> 💡 Render can also **provision a Postgres database** — create a new **PostgreSQL** service and connect it.

## ⚡ 2. Deploy

**Option A — Blueprint (recommended — uses `render.yaml`):**
1. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
2. Connect your GitHub repo — Render reads `render.yaml` and sets everything up automatically

**Option B — Manual Service:**
1. Go to **New → Web Service**
2. Connect your GitHub repo and fill in build/start commands from `render.yaml`

## 📖 More Info
- [Render Docs](https://render.com/docs)
- [render.yaml Reference](https://render.com/docs/blueprint-spec)
