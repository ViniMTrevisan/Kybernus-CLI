import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { cartService } from './cart.registry';
import type { CartKey } from './cart.service';

// ── Helpers ───────────────────────────────────────────────────────────────────
function cartKey(req: Request): CartKey {
  // req.user is attached by authenticate middleware — always present on cart routes
  const user = req.user as { id: string } | undefined;
  if (user) return { userId: user.id };
  // Fallback for anonymous access (not currently used — routes all require auth)
  const sessionId = (req.headers['x-session-id'] as string | undefined) ?? 'anon';
  return { sessionId };
}

// ── Zod schemas ───────────────────────────────────────────────────────────────
const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  qty: z.number().int().min(1, 'Quantidade deve ser maior que zero'),
});

const updateItemSchema = z.object({
  qty: z.number().int().min(0, 'Quantidade não pode ser negativa'),
});

const applyCouponSchema = z.object({
  code: z.string().min(1),
});

const shippingQuerySchema = z.object({
  cep: z.string().regex(/^\d{8}$/, 'CEP inválido — use 8 dígitos numéricos'),
});

// ── Controllers ───────────────────────────────────────────────────────────────
export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await cartService.getCart(cartKey(req));
    res.status(200).json(cart.toRecord());
  } catch (err) {
    next(err);
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = addItemSchema.parse(req.body);
    const cart = await cartService.addItem(cartKey(req), dto);
    res.status(201).json(cart.toRecord());
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { variantId } = req.params as { variantId: string };
    const { qty } = updateItemSchema.parse(req.body);
    const cart = await cartService.updateItem(cartKey(req), variantId, qty);
    res.status(200).json(cart.toRecord());
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { variantId } = req.params as { variantId: string };
    await cartService.removeItem(cartKey(req), variantId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function applyCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = applyCouponSchema.parse(req.body);
    const cart = await cartService.applyCoupon(cartKey(req), code);
    res.status(200).json(cart.toRecord());
  } catch (err) {
    next(err);
  }
}

export async function getShipping(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { cep } = shippingQuerySchema.parse(req.query);
    const options = await cartService.getShippingOptions(cartKey(req), cep);
    res.status(200).json(options);
  } catch (err) {
    next(err);
  }
}
