# Supported Stacks

Kybernus supports a curated list of modern, high-demand technology stacks. Each template is hand-crafted to follow industry best practices.

**All stacks are 100% Free and Open Source.**

## 1. Node.js + Express
The classic, unopinionated backend choice.
*   **Language**: TypeScript (Strict mode).
*   **Features**:
    *   `Setup` with `ts-node-dev` for hot reloading.
    *   `Prisma ORM` for database access.
    *   `MVC Architecture`.
    *   `Clean Architecture` & `Hexagonal Architecture` templates.
    *   `Jest for testing`.

## 2. NestJS
An opinionated framework for building efficient, scalable Node.js server-side applications.
*   **Language**: TypeScript.
*   **Features**:
    *   `Dependency Injection` out of the box.
    *   `Prisma ORM` + `PostgreSQL` native integration.
    *   `Modular architecture` (Modules, Controllers, Providers).
    *   Available in all architectures (MVC, Clean, Hexagonal).

## 3. Java Spring Boot
The enterprise standard.
*   **Language**: Java 17+.
*   **Build Tool**: Maven.
*   **Features**:
    *   `Spring Web MVC`.
    *   `Spring Data JPA`.
    *   `Clean Architecture` & `Hexagonal Architecture` templates.

## 4. Python FastAPI
High performance, easy to learn, fast to code, ready for production.
*   **Language**: Python 3.10+.
*   **Features**:
    *   `Async/Await` native support.
    *   `Pydantic` for data validation.
    *   `SQLAlchemy (Async)` ORM.
    *   `Alembic` for migrations.
    *   Automatic interactive API docs (Swagger UI).

## 5. Next.js
The React Framework for the Web.
*   **Language**: TypeScript.
*   **Features**:
    *   `App Router` (Next.js 14+).
    *   `TailwindCSS` integration.
    *   `Server Actions` for backend logic.
    *   `Prisma ORM` integration.
    *   `NextAuth.js` (Auth.js) setup.
    *   Hexagonal and Clean Architecture implementation.

## 6. n8n Automation Engine
The scalable, enterprise-grade workflow automation platform.
*   **Environment**: Node.js + Python 3 + Pip.
*   **Features**:
    *   `PostgreSQL 16` pre-configured for heavy concurrent execution.
    *   `Filesystem Binary Data Mode` via local persistent volumes.
    *   Custom `Dockerfile` extending the base image to support execution of complex Python scripts (e.g. pandas, requests) natively.
    *   `Global Error Handling` pre-configured to alert on failures.
    *   `Auto Backups` daily workflow out of the box.
*   **Use-Case Templates**:
    *   `Default`: Clean infra base ready for anything.
    *   `AI Assistant`: Webhook + OpenAI architecture.
    *   `CRM Tracker`: Google Sheets to HubSpot via Schedule.
    *   `System Monitor`: Uptime monitoring + Discord Webhook alerts.
