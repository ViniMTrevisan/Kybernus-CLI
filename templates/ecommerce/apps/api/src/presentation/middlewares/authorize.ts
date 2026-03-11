import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/shared/AppError';

/**
 * Factory middleware that restricts access to specific roles.
 * Must be used AFTER the `authenticate` middleware in the chain.
 *
 * @example
 * router.get('/admin-test', authenticate, authorize('ADMIN'), handler);
 */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Token de autenticação não fornecido', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Acesso negado: permissão insuficiente', 403));
    }

    next();
  };
}
