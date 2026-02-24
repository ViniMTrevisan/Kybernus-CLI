# Kybernus CLI Release v2.2.0

## Features & Improvements 🚀

We've overhauled all of our **MVC structured templates**! Previously, these templates used in-memory stores and mock arrays for data management, falling behind our Clean Architecture and Hexagonal templates. 

With `v2.2.0`, every single MVC template now ships with a production-ready database orchestration layer utilizing the best-in-class ORMs tailored for their stack:

### Stack-specific improvements

- **Node.js Express & NestJS**: Intergrated **Prisma** out of the box. Fully wired Authentication and Item services connecting directly to a `schema.prisma` mapping. Added explicit Service layers to replace bloated controllers.
- **Python FastAPI**: Integrated **SQLAlchemy**. Configured Database sessions, extracted Data Access logic into proper `UserRepository` and `ItemRepository` classes, separating Pydantic Schemas from SQLAlchemy Models.
- **Java Spring Boot**: Migrated to **Spring Data JPA**. Extracted `AuthController` logic into an `AuthService`, utilizing proper Domain models in the `model` package instead of isolated entity blobs.
- **Next.js**: Replaced NextAuth's hardcoded mock credentials provider with the `@auth/prisma-adapter`. Hooked Stripe Webhooks accurately into the server actions to persist subscription metrics to the Database.

## Chores & Maintenance 🛠

- All `docker-compose` files within MVC templates now directly tie into these new structures seamlessly.
- Enforced unified patterns so your MVC applications are easily testable, maintainable, and highly decoupled across all layers!
