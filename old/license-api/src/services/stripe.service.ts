import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export class StripeService {
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

        const session = await stripe.checkout.sessions.create({
            mode,
            customer_email: params.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.API_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.API_URL}/checkout/cancel`,
            metadata: {
                licenseKey: params.licenseKey,
                tier: params.tier,
                userId: params.userId,
            },
        });

        return session;
    }

    /**
     * Cancela subscription
     */
    async cancelSubscription(subscriptionId: string) {
        return await stripe.subscriptions.cancel(subscriptionId);
    }

    /**
     * Constrói evento do webhook
     */
    constructEvent(payload: string | Buffer, signature: string) {
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    }
}

export default new StripeService();
