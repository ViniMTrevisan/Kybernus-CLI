import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { checkoutRegistry } from './checkout.registry';
import { AppError } from '../../shared/errors/AppError';

// ── Zod schemas ──────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  shippingCost: z.number().min(0),
  shippingAddress: z
    .record(z.string(), z.string())
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

// ── POST /api/checkout ───────────────────────────────────────────────────────
export async function checkout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user as { id: string };
    const dto = checkoutSchema.parse(req.body);

    const result = await checkoutRegistry.checkoutService.checkout({
      userId: user.id,
      shippingCost: dto.shippingCost,
      shippingAddress: dto.shippingAddress ?? null,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/checkout/webhook ───────────────────────────────────────────────
export async function webhook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new AppError('Header stripe-signature ausente', 400);
    }

    // req.body is a Buffer when using express.raw()
    const payload =
      Buffer.isBuffer(req.body) ? req.body.toString('utf-8') : JSON.stringify(req.body);

    await checkoutRegistry.webhookHandler.handleEvent(payload, signature);
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
