import { Request, Response, NextFunction } from 'express';
import { jwtTokenGenerator } from '../../providers/TokenGenerator';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token not provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtTokenGenerator.verify(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
}