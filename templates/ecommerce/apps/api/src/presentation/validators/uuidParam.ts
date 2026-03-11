import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const uuidSchema = z.string().uuid('ID inválido — formato UUID esperado');

/**
 * Express middleware that validates req.params[paramName] is a valid UUID v4.
 * Returns 400 immediately for malformed IDs, preventing unnecessary DB queries
 * and path traversal attempts.
 */
export function validateUuidParam(paramName = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = uuidSchema.safeParse(req.params[paramName]);
    if (!result.success) {
      res.status(400).json({ error: 'ID inválido — formato UUID esperado' });
      return;
    }
    next();
  };
}
