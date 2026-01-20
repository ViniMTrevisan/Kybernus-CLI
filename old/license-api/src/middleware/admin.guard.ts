import { Request, Response, NextFunction } from 'express';

export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated (populated by prior auth middleware)
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.error('ADMIN_EMAIL not configured in environment');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (req.user.email !== adminEmail) {
        return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }

    next();
};
