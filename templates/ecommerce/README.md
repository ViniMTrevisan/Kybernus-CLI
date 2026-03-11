# E-commerce Template — White-Label

Template completo de e-commerce pronto para produção: backend Express/TypeScript com Prisma + PostgreSQL + Redis, frontend React/Vite, pagamentos via Stripe (cartão, PIX, boleto), upload de imagens via S3/MinIO, e sistema de temas white-label totalmente personalizável.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20 LTS |
| npm | 10+ |
| Docker + Docker Compose | v2+ |
| Stripe CLI *(opcional, para webhooks locais)* | qualquer |

---

## Setup inicial (< 10 minutos)

### 1. Clone e instale dependências

```bash
git clone <seu-repo>
cd ecommerce
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edite `apps/api/.env` com suas chaves do Stripe e demais configurações.  
Para desenvolvimento local, os valores padrão já funcionam com o `docker-compose`.

### 3. Suba os serviços locais (Postgres, Redis, MinIO, Mailpit)

```bash
docker-compose up -d
```

Isso sobe:
- **Postgres** na porta `5435`
- **Redis** na porta `6379`
- **MinIO** (S3 local) nas portas `9000` (API) e `9001` (console web)
- **Mailpit** (captura de emails) nas portas `1025` (SMTP) e `8025` (UI web)

### 4. Execute as migrations do banco

```bash
npm run db:migrate
```

### 5. (Opcional) Popule o banco com dados de teste

```bash
npm run db:seed
```

### 6. Inicie o projeto em modo desenvolvimento

```bash
# Terminal 1 — API
npm run dev:api

# Terminal 2 — Frontend
npm run dev:web
```

- API: http://localhost:3000  
- Frontend: http://localhost:5173
- Mailpit (emails): http://localhost:8025
- MinIO console: http://localhost:9001 (usuário: `minioadmin` / senha: `minioadmin`)

---

## Comandos disponíveis

```bash
# Desenvolvimento
npm run dev:api          # Inicia API em watch mode (ts-node-dev)
npm run dev:web          # Inicia frontend Vite em HMR

# Testes
npm run test:api         # Testes unitários + integração da API (Jest)
npm run test:web         # Testes do frontend (Jest + RTL)
npm run test             # Todos os testes

# Build
npm run build            # Compila API (tsc) + frontend (Vite)

# Banco de dados
npm run db:migrate       # Aplica migrations pendentes (prisma migrate dev)
npm run db:seed          # Popula com dados iniciais
npm run db:studio        # Abre Prisma Studio (GUI do banco)
npm run db:reset         # Reseta o banco e re-aplica migrations (⚠️ destrutivo)

# Qualidade
npm run lint             # ESLint em todos os workspaces
npm run format           # Prettier em todos os arquivos
```

---

## Estrutura do projeto

```
ecommerce/
├── apps/
│   ├── api/                     # Backend Express + TypeScript
│   │   ├── src/
│   │   │   ├── modules/         # Módulos de domínio
│   │   │   │   ├── auth/        # JWT, login, registro, reset de senha
│   │   │   │   ├── catalog/     # Produtos, categorias, imagens
│   │   │   │   ├── cart/        # Carrinho (Redis)
│   │   │   │   ├── checkout/    # Criação de pedido + PaymentIntent Stripe
│   │   │   │   ├── orders/      # Histórico e detalhes de pedidos
│   │   │   │   ├── coupon/      # Cupons de desconto
│   │   │   │   ├── webhook/     # Stripe webhook handler
│   │   │   │   └── admin/       # Dashboard, usuários, relatórios
│   │   │   ├── shared/          # Middlewares, erros, utils
│   │   │   └── config/          # Env, DB (Prisma), Redis, S3, Email
│   │   └── prisma/
│   │       ├── schema.prisma    # Schema de banco (fonte da verdade)
│   │       └── migrations/      # Histórico de migrations
│   └── web/                     # Frontend React 18 + Vite
│       └── src/
│           ├── modules/         # Feature modules espelhando o backend
│           │   ├── auth/        # Login, registro, esqueci a senha
│           │   ├── catalog/     # Listagem e detalhe de produtos
│           │   ├── cart/        # Carrinho de compras
│           │   ├── checkout/    # Fluxo de pagamento (Stripe Elements)
│           │   ├── orders/      # Histórico de pedidos
│           │   ├── admin/       # Painel administrativo
│           │   └── legal/       # Termos de serviço e privacidade
│           └── shared/
│               ├── components/  # Layout, ErrorBoundary, guards
│               ├── config/      # siteConfig.ts ← WHITE-LABEL
│               ├── hooks/       # usePageTitle, etc.
│               └── theme/       # ThemeProvider ← COR PRIMÁRIA
├── scripts/
│   └── customize.sh             # Script interativo de personalização
├── docker-compose.yml
├── Dockerfile                   # Multi-stage build da API
└── package.json                 # NPM Workspaces root
```

---

## Personalização white-label

### Método rápido — script interativo

```bash
bash scripts/customize.sh
```

O script pergunta nome da loja, CNPJ, email de suporte e cor primária, e edita automaticamente os arquivos certos.

### Método manual

**Identidade da loja** — edite `apps/web/src/shared/config/siteConfig.ts`:

```typescript
export const siteConfig = {
  name: 'Minha Loja',          // Nome exibido no header e emails
  tagline: 'Slogan aqui',
  logo: '🛒',                  // Emoji, texto ou caminho de imagem
  url: 'https://minhaloja.com.br',
  supportEmail: 'suporte@minhaloja.com.br',
  privacyEmail: 'privacidade@minhaloja.com.br',
  legal: {
    companyName: 'Minha Loja LTDA',
    cnpj: '00.000.000/0001-00',
    address: 'Rua Exemplo, 123 — São Paulo, SP',
    termsEffectiveDate: '1º de janeiro de 2025',
  },
  // ...
};
```

**Cor primária e tema** — edite `apps/web/src/shared/theme/tokens.ts`:

```typescript
export const defaultTheme: ThemeConfig = {
  storeName: 'Minha Loja',
  colors: {
    primary: '#6366F1',   // ← Troque pela sua cor
    // ...
  },
};
```

Todas as variáveis CSS (`--color-primary`, `--color-secondary`, etc.) são derivadas automaticamente pelo `ThemeProvider` e aplicadas via CSS custom properties em toda a aplicação.

---

## Configuração do Stripe

### 1. Crie uma conta e obtenha as chaves de teste

Acesse https://dashboard.stripe.com/test/apikeys e copie:
- `sk_test_...` → `STRIPE_SECRET_KEY` em `apps/api/.env`
- `pk_test_...` → `VITE_STRIPE_PUBLIC_KEY` em `apps/web/.env`

### 2. Configure o webhook local (para receber eventos em dev)

Instale o [Stripe CLI](https://stripe.com/docs/stripe-cli) e execute:

```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

Copie o `whsec_...` exibido no terminal para `STRIPE_WEBHOOK_SECRET` em `apps/api/.env`.

### 3. Métodos de pagamento habilitados

Por padrão o template suporta **cartão de crédito**, **PIX** e **boleto bancário**.  
Para habilitar PIX e boleto, ative-os no [Dashboard Stripe](https://dashboard.stripe.com/settings/payment_methods) (requer conta verificada com CNPJ para produção).

---

## Configuração de email

### Desenvolvimento

Em desenvolvimento, se `SMTP_HOST` não for definido, a API usa **[Ethereal](https://ethereal.email/)** — um SMTP faker que exibe os emails em `http://localhost:8025` (via Mailpit no docker-compose).

Alternativamente, deixe o compose subir o **Mailpit** (já configurado) e aponte:

```
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=       # vazio
SMTP_PASS=       # vazio
```

### Produção

Configure com seu provedor SMTP (SendGrid, Resend, AWS SES, etc.):

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxx
EMAIL_FROM=noreply@minhaloja.com.br
```

---

## Variáveis de ambiente

Todas as variáveis estão documentadas nos arquivos `.env.example`:

- `apps/api/.env.example` — banco, Redis, JWT, Stripe, SMTP, S3
- `apps/web/.env.example` — URL da API, chave pública do Stripe

---

## Deploy

O `Dockerfile` na raiz realiza um build multi-stage:

1. **builder** — compila TypeScript e gera o Prisma Client
2. **runner** — imagem final com apenas dependências de produção (~200 MB)

```bash
# Build da imagem
docker build -t ecommerce-api .

# Run (passe as variáveis de ambiente necessárias)
docker run -e DATABASE_URL=... -e JWT_SECRET=... -p 3000:3000 ecommerce-api
```

O `docker-compose.yml` inclui o serviço `api` que faz o build automaticamente e executa `prisma migrate deploy` na inicialização.

---

## Testes

```bash
npm run test:api    # 208 testes — unitários + integração (Supertest + Jest)
npm run test:web    # 73 testes — RTL + MSW mocking
```

Os testes de integração da API sobem um banco PostgreSQL real via Testcontainers (Docker necessário).

---

## Licença

MIT
