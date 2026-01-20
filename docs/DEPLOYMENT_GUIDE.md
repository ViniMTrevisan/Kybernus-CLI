# Deployment & Distribution Guide

This document outlines the strategy for deploying the Kybernus infrastructure to production.

## 1. Stripe Configuration

### Webhook URL
When deploying the `license-api` to production (e.g., AWS, DigitalOcean, Railway), you must configure the Stripe Webhook to point to your live domain.

*   **Production URL**: `https://<YOUR_API_DOMAIN>/webhooks/stripe`
*   **Events to Monitor**:
    *   `checkout.session.completed` (Handles Upgrades & New Purchases)
    *   `customer.subscription.deleted` (Handles Cancellations)
    *   `invoice.payment_failed` (Handles Failed Payments)

### Payment Flows

We support two distinct flows for upgrading to Pro.

#### Flow A: Upgrade via CLI (Existing Users)
Best for users who already installed the CLI and registered a free account.
1.  User runs `kybernus upgrade`.
2.  CLI calls `/api/checkout/create` (Authenticated).
3.  User is redirected to Stripe Checkout.
4.  **Webhook Action**: Upgrades the existing license key associated with the user.

#### Flow B: Purchase via Website (New Customers)
Best for traffic landing directly on the website.
1.  User clicks "Buy Pro Lifetime" on the Pricing page.
2.  Redirects to a **Stripe Payment Link** (or Checkout Session).
3.  User enters email and pays.
4.  **Webhook Action**:
    *   API checks if email exists.
    *   **If New**: Creates a new user, generates a Pro License Key, and emails it to the user.
    *   **If Existing**: Upgrades the existing account found by email.

## 2. Infrastructure Requirements

### Database (PostgreSQL)
*   Managed Postgres (RDS, Supabase, Neon).
*   Run `npx prisma migrate deploy` during deployment pipeline.

### API (Node.js)
*   Environment Variables:
    *   `DATABASE_URL`: Production connection string.
    *   `STRIPE_SECRET_KEY`: Live Secret Key (`sk_live_...`).
    *   `STRIPE_WEBHOOK_SECRET`: Live Webhook Secret (`whsec_...`).
    *   `ADMIN_EMAIL`: Your email for admin access.
    *   `JWT_SECRET`: Strong random string.

### CLI Distribution
*   Publish to NPM Registry as `@kybernus/cli` or `kybernus`.
*   Ensure `README.md` and `docs/` are included in the package (via `files` in `package.json`).
