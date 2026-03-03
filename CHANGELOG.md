# Changelog

All notable changes to this project will be documented in this file.

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
