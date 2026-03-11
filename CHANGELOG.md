# Changelog

All notable changes to this project will be documented in this file.

## [3.2.0] - 2026-03-11

### Features
- **E-Commerce White-Label Template**: Added the new `kybernus ecommerce` command to scaffold a fully-featured, production-ready white-label e-commerce platform.
  - **Tech Stack**: Backend in Express.js + Prisma + PostgreSQL + Redis, Frontend in React 18 + Vite, Infra with Docker + MinIO + Mailpit.
  - **Features**: Dynamic branding, integrated payments (Stripe: Card, Pix, Boleto), shopping cart, admin dashboard, and image uploads.
  - **Quality Driven**: Built with TDD, includes comprehensive test suites (Jest, Supertest, RTL), and CI/CD ready.
  - **Customization Engine**: Interactive CLI setup that dynamically injects store credentials (Name, CNPJ, Colors, URLs) into the project configuration (`siteConfig.ts` and `tokens.ts`) out of the box.

## [3.1.0] - 2026-03-05

### Bug Fixes & Improvements — Template Quality Pass

This release is a comprehensive template quality pass across all stacks and architectures, fixing real bugs discovered during manual walkthrough testing. No CLI behaviour changed.

#### Java Spring Boot (MVC, Hexagonal, Clean)

**MVC**
- `application.yml` — full rewrite: fixed catastrophic YAML indentation cascade (all blocks were nested inside each other); restored `stripe.*`, `frontend.url`, and `jwt.*` top-level properties
- `StripeService` — `UUID.fromString(userId)` → `userId` (user ID is stored/retrieved as `String`, not `UUID`)
- `PaymentsController` — `@AuthenticationPrincipal UserDetails` → `@AuthenticationPrincipal String userId` to match what the JWT filter actually sets as principal
- `SecurityConfig` — added `.requestMatchers("/api/health").permitAll()`
- `AuthController` — replaced `Map.of(...)` with `HashMap` to safely handle `null` name on registration
- `docker-compose.yml` — removed deprecated `version` field, renamed service `postgres → db`, added `pg_isready` healthcheck

**Hexagonal**
- `application.properties` — fixed datasource URL `${DB_HOST:localhost}`, JWT secret default, Stripe placeholder values
- `PaymentService` — `UUID.fromString(userId)` → `userId`
- `docker-compose.yml` — DB-only (removed `app` service), healthcheck, port `5432:5432`
- *(new)* `JwtFilter.java` — was missing; Bearer token parser, sets `UserDetails` principal on `SecurityContext`
- *(new)* `SecurityConfig.java` — was missing; stateless session, CSRF disabled, permits `/auth/**`, `/payments/webhook`, `/actuator/**`

**Clean**
- `application.properties` — fixed datasource URL, `jwt.secret` key aligned to `SecurityAdapters`, Stripe placeholder values
- `PaymentUseCase` — full rewrite; file was corrupted with garbled text; also fixed `UUID.fromString(userId)` → `userId`
- `docker-compose.yml` — DB-only, healthcheck, port `5432:5432`
- *(new)* `JwtAuthenticationFilter.java` — was missing
- *(new)* `SecurityConfig.java` — was missing
- *(new)* `JpaUserRepository.java` — was referenced but missing from the template
- *(new)* `UserEntity.java` — was referenced but missing from the template
- *(new)* `StripeGateway.java` — was referenced but missing from the template

---

#### Python FastAPI (MVC, Hexagonal, Clean)

**MVC**
- `docker-compose.yml` — DB-only (removed `app` service), removed `version`, added `pg_isready` healthcheck
- `requirements.txt` — added `pydantic[email]>=2.5.0`, pinned `bcrypt>=3.0.0,<4.0.0` (bcrypt 4.x breaks passlib 1.7.4)
- `app/middleware/security.py` — added `get_current_db_user()` dependency that returns an ORM `User` instance (previously only `get_current_user()` existed, returning a plain dict)
- `app/controllers/payments.py` — fixed import `middleware.auth` → `middleware.security`; both `/checkout` and `/portal` now use `get_current_db_user` so Stripe operations receive the real ORM object
- `app/schemas/item.py` — added `price: Optional[float] = None` to both `ItemCreate` and `ItemResponse`

**Hexagonal**
- `docker-compose.yml` — DB-only, removed `version`, added healthcheck
- `requirements.txt` — added `pydantic[email]`, `email-validator>=2.1.0`, `greenlet>=3.0.0`, pinned `bcrypt<4.0.0`
- `app/core/domain/user.py` — added `from datetime import datetime` import and `created_at: Optional[datetime] = None` field to the frozen dataclass
- `app/core/payment_service.py` — added `import dataclasses`; replaced two `user.stripe_customer_id = x` frozen-dataclass mutations with `dataclasses.replace(user, stripe_customer_id=x)` to fix `FrozenInstanceError`; wrapped Stripe SDK calls in `try/except stripe.StripeError`
- `app/config.py` — added `load_dotenv()` at module top; added `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL` settings fields; fixed DB name default; added `extra="ignore"` to prevent `ValidationError` on startup when `.env` contains undeclared vars
- `app/adapters/inbound/http_adapter.py` — added `LoginRequest(email, password)` model; `/login` endpoint was incorrectly using `RegisterRequest` (which has a mandatory `name` field), now correctly uses `LoginRequest`
- `app/adapters/outbound/stripe_adapter.py` — moved `stripe.api_key` assignment from module level into `__init__` (module-level assignment ran before `load_dotenv()`, always resulting in `None` key)
- `app/infrastructure/database/session.py` — added `async def get_db()` async generator (was imported throughout the app but never defined)
- `app/adapters/inbound/payment_http_adapter.py` — `get_payment_service` now uses `Depends(get_db)` instead of bare `AsyncSessionLocal()` to prevent session leaks
- *(new)* `app/core/ports/__init__.py` — re-exports `IAuthPort`, `IUserRepositoryPort`
- *(new)* `app/core/ports/user_repository.py` — abstract `UserRepository` port with `find_by_id` + `save`
- *(new)* `app/infrastructure/security/__init__.py` — package marker
- *(new)* `app/infrastructure/security/adapters.py` — `BcryptHasher` + `JwtTokenGenerator`
- *(new)* `app/infrastructure/security/jwt.py` — `get_current_user_id` FastAPI dependency
- *(new)* `app/infrastructure/database/user_repository.py` — `SQLAlchemyUserRepository` async implementation

**Clean**
- `docker-compose.yml` — DB-only, removed `version`, added healthcheck
- `requirements.txt` — added `pydantic[email]>=2.5.0`, `greenlet>=3.0.0`, pinned `bcrypt<4.0.0`
- `app/config.py` — fixed default DB name (`{{projectName}}_db` → `{{projectName}}`); added `extra="ignore"`
- `app/main.py` — added `load_dotenv()` before all app imports so settings are populated before `get_settings()` is called at import time
- `app/infrastructure/http/auth_controller.py` — added `UserResponse` + `AuthResponse` Pydantic response models (previously endpoints had no `response_model`, leaking password hashes); added `LoginRequest` + `POST /login` endpoint which was entirely missing
- `app/infrastructure/http/payment_controller.py` — fixed import `SQLAlchemyUserRepository` → `PostgresUserRepository`; `get_payment_service` now uses `Depends(get_db)` to prevent session leaks
- `app/application/services/payment_service.py` — fixed import `UserRepository` → `IUserRepository` (the interface lives under that name in the domain layer)
- *(new)* `app/infrastructure/security/jwt.py` — `get_current_user_id` FastAPI dependency
- *(new)* `app/domain/usecases/login_user.py` — `LoginUserUseCase.execute(email, password)` → verifies credentials, returns `{user, token}`

---

#### NestJS (MVC, Hexagonal, Clean)
- `docker-compose.yml` — DB-only (removed `app` service), removed `version`, added `pg_isready` healthcheck across all archs
- `Dockerfile` — improvements and corrections across all archs
- MVC: fixed `auth.controller.ts`, `auth.service.ts`, `main.ts`, `create-item.dto.ts`, `prisma.service.ts`; *(new)* `health.controller.ts`
- Hexagonal: fixed `user.entity.ts`, `ports.ts`, `main.ts`, `app.module.ts`; *(new)* `health.controller.ts`
- Clean: fixed `payment.service.ts`, `user.entity.ts`, `user.repository.ts`, `prisma.user.repository.ts`, `main.ts`, `app.module.ts`, `payment.module.ts`; *(new)* `health.controller.ts`

#### Node.js Express (MVC, Hexagonal, Clean)
- `docker-compose.yml` — DB-only, removed `version`, added healthcheck across all archs
- `Dockerfile` — improvements across all archs
- `package.json` — dependency corrections across all archs
- Hexagonal: fixed `PaymentController.ts`, `AuthService.ts`, `PaymentService.ts`, `User.ts`; *(new)* `config.ts`, `prisma.ts.hbs` (renamed from unprocessed `prisma.ts`)
- Clean: fixed `User.ts`; *(new)* `config.ts`

#### Next.js (MVC)
- `docker-compose.yml` — DB-only, removed `version`, added healthcheck
- `Dockerfile` — improvements

---

#### All Stacks — `.gitignore` Added
Added `.gitignore.hbs` to the 12 template directories that were missing it:

| Stack | Archs | Key ignores |
|---|---|---|
| Java Spring Boot | mvc, hexagonal, clean | `target/`, `*.class`, `*.jar`, `.idea/`, `.env*`, `application-local.*` |
| NestJS | mvc, hexagonal, clean | `node_modules/`, `dist/`, `*.tsbuildinfo`, `.env*`, `coverage/` |
| Node.js Express | mvc, hexagonal, clean | same as NestJS |
| Python FastAPI | mvc, hexagonal, clean | `__pycache__/`, `.venv/`, `.env*`, `.pytest_cache/`, `.coverage`, `.mypy_cache/` |

---

## [3.0.1] - 2026-03-04
### Major Features
- **Standalone Project Support**: Kybernus can now be used in any project! Commands like `add`, `auth`, and `deploy` will guide you to select your stack and architecture if a `.kybernusrc.json` is not found.
- **New Modular Pillars**:
  - **`kybernus auth`**: Injects complete JWT Authentication logic (MVC/Clean) for all supported stacks.
  - **`kybernus deploy`**: Generates production-ready configurations for **Vercel**, **Railway**, **Fly.io**, and **Render**.
  - **`kybernus add`**: On-demand feature injection for Swagger, Redis, Websocket Server, and Husky + Commitlint.
- **Custom Templates**: Added support for the `--template` flag in `init`, allowing users to scaffold projects directly from any GitHub repository.
- **`kybernus doctor`**: New diagnostic command to verify system requirements (Node, Python, Java, Docker) and configuration health.

### Internal & UI
- **Generator Engine Refactor**: Applied SOLID and DRY principles to the core generation logic for better maintainability and extensibility.
- **Shared CLI Utilities**: Centralized common CLI patterns (prompts, configuration reading, error handling) in a new `cli-helpers` module.
- **Comprehensive Testing Suite**: Added 37 unit tests covering all generator logic, CLI commands, and edge cases.
- **Improved UI/UX**: Enhanced interactive prompts and spinners using `@clack/prompts` for a more premium experience.


## [2.4.0] - 2026-03-03
### Features
- **n8n Automation Engine**: Added a brand new stack to generate enterprise-grade n8n environments.
  - **Infrastructure**: Includes PostgreSQL 16, Redis, custom Dockerfile with Python 3 / pip / npm support, and persistent volumes for filesystem binary data mode.
  - **Use Cases**: Four templates are available out of the box:
    - `default`: Base infrastructure with golden workflows.
    - `ai-assistant`: Webhook + OpenAI integration.
    - `crm-tracker`: Schedule + Google Sheets + HubSpot integration.
    - `system-monitor`: Uptime checker + Discord alerts.
  - **Golden Workflows**: Auto-backup and Global Error Handlers automatically injected into all templates.
  - **Specific Setup Guides**: Auto-generated `SETUP.md` with exactly what credentials to fill out based on the chosen use case.
  - **Handlebars Compatibility**: Escaped internal n8n syntax to prevent compiler clashes during template generation.

## [2.3.0] - 2026-03-02
### Features
- **Full Stripe Integration**: Added complete Stripe payment support across all 5 stacks and 14 architecture variants (MVC, Clean, Hexagonal).
  - `POST /api/payments/checkout` — creates a Stripe Checkout session; auto-creates the Stripe customer and links it to the user in the database.
  - `POST /api/payments/portal` — opens the Stripe Billing Portal for subscription management.
  - `POST /api/payments/webhook` — validates signatures and handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed` events with real database updates.
- **Stripe API version**: `2026-02-25.clover` used across all templates.
- **Raw body middleware** correctly configured for webhook signature verification in all stacks (Express `express.raw()`, NestJS `rawBody: true`, Next.js `request.text()`, FastAPI `request.body()`, Spring Boot `@RequestBody String`).

### Stacks Updated
| Stack | MVC | Clean | Hexagonal |
|---|---|---|---|
| Node.js Express | ✅ | ✅ | ✅ |
| Python FastAPI | ✅ | ✅ | ✅ |
| NestJS | ✅ | ✅ | ✅ |
| Java Spring Boot | ✅ | ✅ | ✅ |
| Next.js | ✅ | — | — |

## [2.2.1] - 2026-03-02
### Security & Infrastructure (Terraform)
- **VPC Networking**: Fixed critical routing issues. Public subnets now have correct Route Tables directing to the Internet Gateway. Private subnets route to a newly provisioned NAT Gateway (with Elastic IP), enabling essential outbound internet access for containers.
- **ECS Fargate Provisioning**: Completed the ECS setup across all templates. Added Application Load Balancer (ALB), Target Groups, Listeners, ECR Repository, and necessary IAM Roles (Task & Execution).
- **RDS Security**: Hardened PostgreSQL database security. Ingress rules were updated to accept traffic *only* from the ECS Tasks Security Group, blocking unauthorized VPC-wide access.
- **Unified Formatting**: Applied `terraform fmt` across all 13 Terraform project variants ensuring strict HashiCorp Configuration Language standards while preserving Handlebars interpolation.

## [2.2.0] - 2026-02-24
### Major Refactor
- **MVC Templates Upgrade**: Transformed all MVC templates (Java Spring, NestJS, Next.js, Node.js Express, Python FastAPI) from basic in-memory mocked structures into production-ready architectures supporting real databases out of the box (PostgreSQL via JPA, Prisma, SQLAlchemy).
- **Architecture Standardization**: Extracted logic from Controllers to Services/Repositories across all stacks to enforce proper separation of concerns.

## [2.1.1] - 2026-02-18
### Fixes
- **CI/CD**: Fixed `npm-shrinkwrap.json` syncing issue that caused build failures in CI environments.

## [2.1.0] - 2026-02-18
### Major Refactor
- **Template Modernization**: Comprehensive update to all project templates (Python, Node.js, Next.js, NestJS, Java Spring) to align with industry best practices.
- **Database Integration**: Added native PostgreSQL support across all templates using modern ORMs (Prisma, SQLAlchemy, JPA).
- **Architecture Standardization**: improved Clean and Hexagonal architecture implementations with stricter segregation of concerns and consistent folder structures.

### Improvements
- **Python FastAPI**: Added `asyncpg` + `SQLAlchemy` (Async) support. Standardized `clean` vs `hexagonal` structures.
- **Node.js / Express**: Migrated to Prisma ORM. Added `zod` validation and improved dependency injection wiring.
- **Next.js**: Updated to React 18 and Next.js App Router. Added integrated Auth API routes with Prisma.
- **NestJS**: Integrated `PrismaModule` and standardized Module/Adapter wiring for both architectures.
- **Java Spring**: Added `application.properties` configuration, migrated to Spring Data JPA, and restructured Hexagonal architecture to strictly follow Core/Adapter patterns.

### Fixes
- **Dependency Issues**: Resolved missing dependencies and incorrect package versions across multiple templates.
- **Wiring Bugs**: Fixed issues where Use Cases and Repositories were not incorrectly connected in Clean Architecture templates.

## [2.0.10] - 2026-02-13
### Improvements
- **Zero-Friction Start**: Switched primary installation method to `npx kybernus@latest init`. This removes the need for global installation and ensures users always run the latest version.
- **Documentation**: Updated `README.md` and website components to reflect the new `npx` workflow.

### Fixes
- **Analytics**: Fixed a bug where `project_generated` events were not being tracked because the process exited before the event was sent. Added `await` to the tracking call.

## [2.0.9] - 2026-02-08
### Fixes
- **Docker Compose Indentation**: Fixed a critical indentation issue in `docker-compose.yml.hbs` files across all templates. The `volumes` section is now correctly placed at the root level, and service definitions are properly nested.

## [2.0.8] - 2026-02-08
### Fixes
- **Critical Template Fixes**: Corrected `Dockerfile` and CI/CD workflows for `java-spring` (MVC, Clean, Hexagonal) and `python-fastapi` (MVC, Clean, Hexagonal) templates. They now correctly use Java/Maven and Python/Pip environments instead of incorrect Node.js configurations.
- **CI/CD Indentation**: Fixed indentation issues in all generated GitHub Actions workflows to ensure valid YAML syntax.

## [2.0.7] - 2026-02-06
### Fixes
- **Bundled Dependencies**: Enabled `bundledDependencies` to ship the exact validated dependency tree (including security overrides) to consumers. This eliminates install-time deprecation warnings by bypassing client-side resolution.

## [2.0.6] - 2026-02-06
### Fixes
- Added `npm-shrinkwrap.json` to enforce security overrides (`rimraf` -> `glob`) for consumers. This resolves deprecation warnings during installation.

## [2.0.5] - 2026-02-06
### Security
- Resolved `glob` security vulnerability warning by overriding transitive dependencies.
- Added `overrides` for `rimraf` to ensure use of secure `glob` versions.
### Changed
- Updated `@google/genai` to `^1.40.0`.
