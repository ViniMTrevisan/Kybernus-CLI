import express from 'express';
import { LicenseService } from '../services/license.service.js';

const router = express.Router();
const licenseService = new LicenseService();

/**
 * POST /api/auth/register
 * Cria trial de 15 dias
 */
router.post('/register', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Verifica se já existe
        const existing = await licenseService.findByEmail(email);
        if (existing) {
            return res.status(400).json({
                error: 'Email already registered',
                licenseKey: existing.licenseKey,
                status: existing.status,
            });
        }

        // Cria trial
        const user = await licenseService.createTrialUser(email);

        res.status(201).json({
            success: true,
            licenseKey: user.licenseKey,
            tier: user.tier.toLowerCase(),
            status: user.status,
            trialStartedAt: user.trialStartedAt,
            trialEndsAt: user.trialEndsAt,
            message: 'Trial activated for 15 days',
        });

    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/licenses/validate
 * Valida license key
 */
router.post('/validate', async (req, res) => {
    try {
        const { licenseKey } = req.body;

        if (!licenseKey) {
            return res.status(400).json({ error: 'License key is required' });
        }

        const result = await licenseService.validate(licenseKey);

        if (!result.valid) {
            return res.status(401).json(result);
        }

        res.json(result);

    } catch (error: any) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/licenses/consume
 * Consome crédito de projeto (ou verifica limite)
 */
router.post('/consume', async (req, res) => {
    try {
        const { licenseKey } = req.body;
        if (!licenseKey) return res.status(400).json({ error: 'License key is required' });

        const result = await licenseService.consumeProjectCredit(licenseKey);

        if (!result.authorized) {
            return res.status(403).json(result);
        }

        res.json(result);
    } catch (error: any) {
        console.error('Consume error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
