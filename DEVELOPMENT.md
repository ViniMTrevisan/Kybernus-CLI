# Kybernus CLI 🚀

[![CI](https://github.com/ViniMTrevisan/Kybernus-CLI/workflows/CI%20-%20Tests/badge.svg)](https://github.com/ViniMTrevisan/Kybernus-CLI/actions)
[![npm version](https://img.shields.io/npm/v/kybernus)](https://www.npmjs.com/package/kybernus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**The Ultimate Backend Scaffolding Tool for Modern Developers.**

Build production-ready applications in minutes, not days. Kybernus automates the setup of robust, scalable backend and fullstack architectures with industry best practices built-in.

---

## 📦 Project Structure

```
kybernus/
├── apps/web/           # Next.js Web Application (Dashboard, Admin, APIs)
├── src/                # CLI Source Code
├── templates/          # Project Templates (5 stacks × 2 tiers)
├── tests/              # Automated Test Suite
└── docs/               # Documentation
```

### Components

| Component | Description |
|-----------|-------------|
| **CLI** | Interactive command-line tool for project scaffolding |
| **Web App** | Dashboard, authentication, admin panel, payment integration |
| **License System** | Trial/Free/Pro tiers with usage tracking |
| **Templates** | Production-ready project templates for 5 tech stacks |

---

## 🛠️ Tech Stack

### CLI
- **TypeScript** - Type-safe codebase
- **Commander.js** - CLI framework
- **Clack** - Beautiful interactive prompts
- **Handlebars** - Template engine
- **Google Gemini** - AI-powered documentation (Pro)

### Web Application
- **Next.js 16** - React framework with App Router
- **PostgreSQL** - Database (via Prisma ORM)
- **Stripe** - Payment processing
- **Resend** - Transactional emails
- **Upstash Redis** - Rate limiting & caching
- **TailwindCSS** - Styling

---

## 🚀 Supported Stacks & Architectures

| Stack | Free Tier | Pro Tier 🌟 |
|:------|:---------:|:-----------:|
| **Node.js + Express** | ✅ MVC | ✅ Clean/Hexagonal |
| **Next.js** | ✅ MVC | ✅ Clean/Hexagonal |
| **Java Spring Boot** | ✅ MVC | ✅ Clean/Hexagonal |
| **NestJS** | ❌ | ✅ All Patterns |
| **Python FastAPI** | ❌ | ✅ All Patterns |

### Features by Tier

| Feature | Free | Trial (15 days) | Pro ($97) |
|:--------|:----:|:---------------:|:---------:|
| Basic Stacks | ✅ | ✅ | ✅ |
| Pro Stacks (NestJS, FastAPI) | ❌ | ✅ | ✅ |
| Clean/Hexagonal Architecture | ❌ | ✅ | ✅ |
| Docker & CI/CD | ❌ | ✅ | ✅ |
| Terraform Configs | ❌ | ✅ | ✅ |
| AI Documentation | ❌ | ✅ | ✅ |
| Project Limit | Unlimited | 3 Projects | Unlimited |

---

## 📖 CLI Commands

```bash
# Installation
npm install -g kybernus

# Core Commands
kybernus init              # Start the interactive project generator
kybernus register          # Create a free trial account (15 days, 3 projects)
kybernus login             # Authenticate with a license key
kybernus status            # Check license status and usage
kybernus upgrade           # Upgrade to Pro ($97 lifetime)
kybernus logout            # Sign out and remove license
```

### Usage Example

```bash
# Start a new project
$ kybernus init

┌  🚀 Kybernus Project Generator
│
◆  Project name: my-api
◆  Select your stack:
│  ● Node.js + Express
│  ○ NestJS (Pro)
│  ○ Java Spring Boot
│  ○ Python FastAPI (Pro)
│  ○ Next.js
│
◆  Architecture: Clean Architecture
◆  Include Docker? Yes
◆  Generate AI docs? Yes
│
└  ✔ Project created successfully!
```

---

## 🌐 Web Application

The web app (`apps/web/`) provides:

### Public Pages
- **Landing Page** - Product showcase with pricing
- **Documentation** - CLI reference and guides
- **Privacy Policy** & **Terms of Service**

### Authentication
- **Register/Login** - Email + password with bcrypt hashing
- **Password Recovery** - Email-based reset flow
- **Session Management** - JWT with 7-day persistence
- **Cookie Consent** - LGPD compliant

### User Dashboard
- License key display & copy
- Usage tracking (projects used / limit)
- Profile management (email/password updates)
- Upgrade to Pro via Stripe

### Admin Panel
- User management with search/filter
- Analytics dashboard
- System metrics

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Create trial account |
| `POST /api/auth/login` | Authenticate user |
| `POST /api/licenses/validate` | Validate license key |
| `POST /api/licenses/consume` | Consume a project credit |
| `POST /api/checkout` | Create Stripe checkout session |
| `POST /api/webhooks/stripe` | Handle payment webhooks |
| `GET /api/user/me` | Get current user data |
| `GET /api/admin/dashboard` | Admin analytics |

---

## 🧪 Testing

```bash
# Run all CLI tests (unit)
npm test

# Run web app tests
cd apps/web && npm test

# Run with watch mode
npm run test:watch
```

### Test Coverage
- **CLI Unit Tests**: 14 tests - Config, Generator, License Validator
- **Web Unit Tests**: 5 tests - Email templates
- **E2E Tests**: 40+ tests - API integration (run locally)

---

## 🚢 Deployment

### Web App (Vercel)
1. Import repo to Vercel
2. Set **Root Directory**: `apps/web`
3. Add environment variables
4. Deploy

### CLI (NPM)
```bash
# Bump version
npm version patch

# Create and push tag
git tag v1.0.0
git push --tags

# GitHub Actions auto-publishes to NPM
```

See [VERCEL_README.md](apps/web/VERCEL_README.md) for detailed deployment guide.

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker)
- NPM account (for publishing)

### Local Setup

```bash
# Clone repository
git clone https://github.com/ViniMTrevisan/Kybernus-CLI.git
cd Kybernus-CLI

# Install CLI dependencies
npm install
npm run build

# Install Web dependencies
cd apps/web
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## 📁 Template Structure

Each template includes:

```
templates/{stack}/{tier}/
├── src/
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access (Clean/Hex only)
│   ├── entities/        # Domain models (Clean/Hex only)
│   └── ports/           # Interfaces (Hexagonal only)
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .github/
│   └── workflows/       # CI/CD pipelines
├── terraform/           # Infrastructure as Code
└── README.md
```

---

## 🔐 License System

### How It Works
1. **Free Mode**: Basic stacks, MVC only, unlimited projects
2. **Trial Mode**: Full Pro access for 15 days, 3 project limit
3. **Pro Mode**: Lifetime access, all features, unlimited projects

### License Key **Format:**
- Trial: `KYB-TRIAL-XXXX-XXXX-XXXX-XXXXXXXX` (with HMAC signature)
- Pro: `KYB-PRO-XXXX-XXXX-XXXX-XXXXXXXX` (with HMAC signature)
- Legacy (backward compatible): `KYB-{TIER}-XXXX-XXXX-XXXX` (without signature)

### Validation Flow
```
CLI → validate(licenseKey) → API → Database → Response
     ← { valid, tier, usage, limit } ←
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

- **Documentation**: [kybernus.dev/docs](https://kybernus.vercel.app/docs)
- **Issues**: [GitHub Issues](https://github.com/ViniMTrevisan/Kybernus-CLI/issues)
- **Email**: support@kybernus.dev

---

<p align="center">
  <strong>Code less, Build more.</strong><br>
  © 2026 Kybernus Systems. All rights reserved.
</p>
