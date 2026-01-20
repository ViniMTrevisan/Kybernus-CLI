import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

export interface CreateCheckoutSessionParams {
    priceId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
}

export class StripeService {
    /**
    * Create a checkout session for subscription
    */
    async createCheckoutSession(params: CreateCheckoutSessionParams) {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            customer: params.customerId,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
        });

        return session;
    }

    /**
    * Create a customer portal session
    */
    async createPortalSession(customerId: string, returnUrl: string) {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return session;
    }

    /**
    * Handle webhook event
    */
    async handleWebhook(rawBody: Buffer, signature: string) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        );

        switch (event.type) {
            case 'checkout.session.completed':
            const session = event.data.object;
            // Handle successful subscription
            console.log('Checkout completed:', session.id);
            break;

            case 'customer.subscription.updated':
            const subscription = event.data.object;
            // Handle subscription update
            console.log('Subscription updated:', subscription.id);
            break;

            case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            // Handle subscription cancellation
            console.log('Subscription deleted:', deletedSubscription.id);
            break;

            case 'invoice.payment_failed':
            const invoice = event.data.object;
            // Handle failed payment
            console.log('Payment failed:', invoice.id);
            break;
        }

        return { received: true };
    }

    /**
    * Create a Stripe customer
    */
    async createCustomer(email: string, name?: string) {
        const customer = await stripe.customers.create({
            email,
            name,
        });

        return customer;
    }
}

export const stripeService = new StripeService();