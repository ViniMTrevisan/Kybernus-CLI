import express from 'express';
import analyticsService from '../services/analytics.service.js';

const router = express.Router();

/**
 * POST /api/analytics/track
 * Rastreia evento do CLI
 */
router.post('/track', async (req, res) => {
    try {
        const {
            licenseKey,
            event,
            tier,
            stack,
            architecture,
            command,
            metadata,
        } = req.body;

        if (!event) {
            return res.status(400).json({ error: 'Event is required' });
        }

        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await analyticsService.track({
            licenseKey,
            event,
            tier,
            stack,
            architecture,
            command,
            metadata,
            ipAddress,
            userAgent,
        });

        res.json({ tracked: true });

    } catch (error: any) {
        console.error('Analytics tracking error:', error);
        // Don't fail the request if analytics fails
        res.json({ tracked: false });
    }
});

export default router;
