import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from './jwt.config';

/**
 * Extends Express Request to include the authenticated user payload.
 */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Middleware that validates the JWT from the Authorization header.
 * 
 * Usage:
 * router.get('/protected-route', authMiddleware, controllerHandler);
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }

    const token = header.split(' ')[1];

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
