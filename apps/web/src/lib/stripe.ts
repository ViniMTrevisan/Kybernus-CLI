import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY not set - Stripe functionality will be disabled');
}

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2025-12-15.clover',
    })
    : null;

export class StripeService {
    private stripe: Stripe;

    constructor() {
        if (!stripe) {
            throw new Error('Stripe is not configured');
        }
        this.stripe = stripe;
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

export const stripeService = new StripeService();
