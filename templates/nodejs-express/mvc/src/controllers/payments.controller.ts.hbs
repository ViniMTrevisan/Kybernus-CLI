import { Router, Request, Response } from 'express';
import { stripeService } from '../services/stripe.service';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

/**
* @route POST /api/payments/checkout
* @desc Create a Stripe checkout session
*/
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { priceId } = req.body;

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }

        const session = await stripeService.createCheckoutSession({
            priceId,
            successUrl: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${process.env.FRONTEND_URL}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

/**
* @route POST /api/payments/portal
* @desc Create a Stripe customer portal session
*/
router.post('/portal', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { customerId } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        const session = await stripeService.createPortalSession(
            customerId,
            `${process.env.FRONTEND_URL}/dashboard`
        );

        res.json({ url: session.url });
    } catch (error) {
        console.error('Portal error:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

/**
* @route POST /api/payments/webhook
* @desc Handle Stripe webhook events
*/
router.post('/webhook', async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    try {
        const result = await stripeService.handleWebhook(req.body, signature);
        res.json(result);
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook handling failed' });
    }
});

export default router;