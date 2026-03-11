import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '../../domain/shared/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // Express requires 4-arg signature to recognise error middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Zod validation errors — always 400
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    res.status(400).json({ error: messages });
    return;
  }

  // Multer file size exceeded
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'Arquivo excede o tamanho máximo de 5 MB' });
    return;
  }

  // Operational errors (AppError) — safe to expose message to client
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Duck-typed errors with statusCode (e.g. from third-party libs or test stubs)
  const duckStatusCode = (err as unknown as Record<string, unknown>)['statusCode'];
  if (typeof duckStatusCode === 'number' && duckStatusCode >= 400 && duckStatusCode < 600) {
    res.status(duckStatusCode).json({ error: err.message });
    return;
  }

  // Unexpected / programmer errors — never leak internals in production
  const isProduction = process.env['NODE_ENV'] === 'production';

  if (isProduction) {
    res.status(500).json({ error: 'Internal Server Error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
