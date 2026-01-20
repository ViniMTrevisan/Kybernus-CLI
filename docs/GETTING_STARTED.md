# Getting Started with Kybernus

Welcome to Kybernus! This guide will help you install the CLI, set up your account, and generate your first production-ready backend project in minutes.

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
npx kybernus init
```

## 2. Setting Up Your Account

Kybernus offers a generous Free tier and a powerful Pro tier. To access features and manage your projects, you'll need an account.

### Register
Create a new account straight from your terminal. You'll receive **3 Free Pro Projects** to try out premium features (like Clean Architecture and NestJS).

```bash
kybernus register
```
Follow the prompts to enter your email and set a password.

### Login
If you already have an account (or purchased a license), log in to sync your status:

```bash
kybernus login
```

### Check Status
Verify your current plan and usage limits:

```bash
kybernus status
```

## 3. Creating Your First Project

The `init` command is the heart of Kybernus. It launches an interactive wizard to configure your new application.

```bash
kybernus init
```

### The Wizard Flow
1.  **Project Name**: Choose a name (kebab-case recommended, e.g., `my-awesome-api`).
2.  **Stack Selection**:
    *   *Free*: Node.js (Express), Java Spring Boot, Next.js.
    *   *Pro*: NestJS, Python FastAPI.
3.  **Architecture**:
    *   *Free*: MVC (Model-View-Controller).
    *   *Pro*: Clean Architecture, Hexagonal Architecture.
4.  **DevOps & Extras** (Pro):
    *   Docker & Docker Compose.
    *   CI/CD Pipelines (GitHub Actions).
    *   Terraform (AWS Infrastructure).
    *   AI Documentation (Gemini).

## 4. Next Steps

Once generated, navigate into your project folder. You'll find a fully configured codebase ready to run.

```bash
cd my-awesome-api
npm install
npm run dev
```

Check out the `README.md` inside your generated project for specific build and run instructions tailored to the stack you chose.
