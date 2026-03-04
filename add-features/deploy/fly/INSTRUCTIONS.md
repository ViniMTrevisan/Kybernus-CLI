# 🚀 Deploy to Fly.io

Your deployment configuration has been generated for **Fly.io**.

## 📁 Files generated

- `fly.toml` — Fly.io app configuration
- `Dockerfile` — Container image definition

## 🔧 1. Install the Fly CLI

```bash
# macOS
brew install flyctl

# Linux / WSL
curl -L https://fly.io/install.sh | sh
```

## 🔑 2. Set Secrets (Environment Variables)

```bash
fly secrets set DATABASE_URL="your-db-connection-string"
fly secrets set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
```

## ⚡ 3. Deploy

```bash
fly auth login
fly launch    # First time: creates the app and allocates resources
fly deploy    # Subsequent deploys
```

> 💡 **Tip:** `fly launch` will walk you through a wizard. When it asks "Would you like to deploy now?", you can say Yes.

## 📖 More Info
- [Fly.io Docs](https://fly.io/docs)
- [fly.toml Reference](https://fly.io/docs/reference/configuration)
