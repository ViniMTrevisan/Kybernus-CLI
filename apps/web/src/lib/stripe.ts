import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV !== 'production') {
    console.warn('STRIPE_SECRET_KEY not set - Stripe functionality will be disabled');
}

// Lazy initialization - only create Stripe instance when needed
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
    if (!stripeSecretKey) return null;
    if (!stripeInstance) {
        stripeInstance = new Stripe(stripeSecretKey, {
            apiVersion: '2025-12-15.clover',
        });
    }
    return stripeInstance;
}

// For backward compatibility
export const stripe = stripeSecretKey ? getStripe() : null;

export class StripeService {
    private stripe: Stripe;

    constructor() {
        const s = getStripe();
        if (!s) {
            throw new Error('Stripe is not configured - STRIPE_SECRET_KEY is missing');
        }
        this.stripe = s;
    }

    /**
     * Cria Checkout Session para FREE ou PRO
     */
    async createCheckoutSession(params: {
        licenseKey: string;
        tier: 'free' | 'pro';
        email: string;
        userId: string;
    }) {
        const priceId = params.tier === 'free'
            ? process.env.STRIPE_PRICE_ID_FREE_MONTHLY!
            : process.env.STRIPE_PRICE_ID_PRO_LIFETIME!;

        const mode = params.tier === 'free' ? 'subscription' : 'payment';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';

        const session = await this.stripe.checkout.sessions.create({
            mode,
            customer_email: params.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/checkout/cancel`,
            metadata: {
                licenseKey: params.licenseKey,
                tier: params.tier,
                userId: params.userId,
            },
        });

        return session;
    }

    /**
     * Cria Checkout Session para novo cliente (via website)
     */
    async createWebCheckoutSession(params: {
        tier: 'free' | 'pro';
        email?: string;
    }) {
        const priceId = params.tier === 'free'
            ? process.env.STRIPE_PRICE_ID_FREE_MONTHLY!
            : process.env.STRIPE_PRICE_ID_PRO_LIFETIME!;

        const mode = params.tier === 'free' ? 'subscription' : 'payment';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            mode,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/checkout/cancel`,
        };

        if (params.email) {
            sessionConfig.customer_email = params.email;
        }

        const session = await this.stripe.checkout.sessions.create(sessionConfig);
        return session;
    }

    /**
     * Cancela subscription
     */
    async cancelSubscription(subscriptionId: string) {
        return await this.stripe.subscriptions.cancel(subscriptionId);
    }

    /**
     * Constrói evento do webhook
     */
    constructEvent(payload: string | Buffer, signature: string) {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    }
}

// Lazy singleton - only instantiated when first accessed
let stripeServiceInstance: StripeService | null = null;

export function getStripeService(): StripeService {
    if (!stripeServiceInstance) {
        stripeServiceInstance = new StripeService();
    }
    return stripeServiceInstance;
}

// IMPORTANT: Do not instantiate at module load time!
// Use getStripeService() in API routes instead of stripeService
// This export is only for backward compatibility and will be null during build
export const stripeService = null as unknown as StripeService;
