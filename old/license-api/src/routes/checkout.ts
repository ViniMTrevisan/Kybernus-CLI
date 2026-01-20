import express from 'express';
import stripeService from '../services/stripe.service.js';
import { LicenseService } from '../services/license.service.js';
import prisma from '../database/client.js';

const router = express.Router();
const licenseService = new LicenseService();

/**
 * POST /api/checkout/create
 * Cria Stripe Checkout Session
 */
router.post('/create', async (req, res) => {
    try {
        const { licenseKey, tier } = req.body;

        if (!licenseKey || !tier) {
            return res.status(400).json({ error: 'licenseKey and tier are required' });
        }

        if (tier !== 'free' && tier !== 'pro') {
            return res.status(400).json({ error: 'tier must be "free" or "pro"' });
        }

        // Busca usuário
        const user = await prisma.user.findUnique({
            where: { licenseKey },
        });

        if (!user) {
            return res.status(404).json({ error: 'License not found' });
        }

        // Cria checkout session
        const session = await stripeService.createCheckoutSession({
            licenseKey,
            tier,
            email: user.email,
            userId: user.id,
        });

        res.json({
            checkoutUrl: session.url,
            sessionId: session.id,
        });

    } catch (error: any) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

/**
 * GET /checkout/success
 * Página de sucesso após pagamento
 */
router.get('/success', (req, res) => {
    const { session_id } = req.query;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Success! | Kybernus</title>
            <style>
                body { font-family: system-ui; padding: 40px; text-align: center; }
                .success { color: #10b981; font-size: 48px; }
                h1 { margin: 20px 0; }
                .box { background: #f3f4f6; padding: 30px; border-radius: 8px; max-width: 600px; margin: 20px auto; }
                code { background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="success">✅</div>
            <h1>Payment Successful!</h1>
            <div class="box">
                <p>Your Kybernus CLI license has been activated.</p>
                <p>Check your email for your new license key.</p>
                <br>
                <p><strong>Next steps:</strong></p>
                <p>Run <code>kybernus login</code> and enter your new license key.</p>
            </div>
        </body>
        </html>
    `);
});

/**
 * GET /checkout/cancel
 * Página de cancelamento
 */
router.get('/cancel', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cancelled | Kybernus</title>
            <style>
                body { font-family: system-ui; padding: 40px; text-align: center; }
                h1 { margin: 20px 0; }
                a { color: #3b82f6; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>Payment Cancelled</h1>
            <p>No worries! You can try again anytime.</p>
            <p><a href="https://kybernus.dev">Return to website</a></p>
        </body>
        </html>
    `);
});

export default router;
