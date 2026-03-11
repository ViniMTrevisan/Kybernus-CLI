import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../../infrastructure/config/registry/auth.registry';
import { AppError } from '../../domain/shared/AppError';

/**
 * Extends Express Request so downstream handlers can access the
 * authenticated user payload injected by this middleware.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticação não fornecido', 401));
  }

  const token = authHeader.slice(7); // Remove "Bearer "

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role ?? 'CUSTOMER' };
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Token inválido ou expirado', 401));
  }
}
