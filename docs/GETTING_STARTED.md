# Getting Started with Kybernus

Welcome to Kybernus! This guide will help you install the CLI and generate your first production-ready backend project in minutes—or enhance an existing one.

## 1. Installation

Kybernus is a Node.js CLI tool. You'll need **Node.js 18+** installed on your machine.

### Global Installation (Recommended)
Installing globally allows you to run `kybernus` from any directory.

```bash
npm install -g kybernus
```

### Using npx (One-time use)
If you prefer not to install it globally, you can run the latest version on demand:

```bash
npx kybernus@latest init
```

## 2. Creating Your First Project

The `init` command is the heart of Kybernus. It launches an interactive wizard to configure your new application.

```bash
kybernus init
```

### The Wizard Flow
1.  **Project Name**: Choose a name (kebab-case recommended, e.g., `my-awesome-api`).
2.  **Stack Selection**:
    *   Node.js (Express)
    *   Java Spring Boot
    *   Next.js
    *   NestJS
    *   Python FastAPI
    *   **Automation Engine (n8n)**
3.  **Architecture / Use Case**:
    *   For Code Stacks: MVC, Clean Architecture, Hexagonal Architecture
    *   For n8n: Default, AI Assistant, CRM Tracker, System Monitor
4.  **DevOps & Extras**:
    *   Docker & Docker Compose.
    *   CI/CD Pipelines (GitHub Actions).
    *   Terraform (AWS Infrastructure).
    *   AI Documentation (Gemini).

### Different Flow: Enhancing Existing Projects
Kybernus isn't just for new projects. You can run commands inside **any** project (even if not made with Kybernus) to add professional features.

# Add Swagger, Redis, Websockets...
kybernus add swagger

# Add complete JWT Authentication 
kybernus auth

# Generate deployment configurations
kybernus deploy
```

## 3. Next Steps

Once you've initialized or enhanced your project:

1.  **Check Environment**: Run `kybernus doctor` to ensure your system is ready.
2.  **Install Deps**: Run the install command for your stack (`npm install`, `pip install`, etc).
3.  **Configure `.env`**: Fill in secrets like `DATABASE_URL` or `JWT_SECRET`.
4.  **Go Live**: Use `kybernus deploy` to generate cloud config files.

