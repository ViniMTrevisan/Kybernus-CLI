import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.format(),
    });
  }

  if (err.message === 'User already exists' || err.message === 'Invalid credentials') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal Server Error' });
}
