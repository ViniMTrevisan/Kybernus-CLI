import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * POST /api/auth/admin-login
 * Login administrativo
 */
router.post('/admin-login', (req, res) => {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPass) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (email === adminEmail && password === adminPass) {
        // Issue token
        const token = jwt.sign(
            { email: adminEmail, role: 'admin' },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
});

export default router;
