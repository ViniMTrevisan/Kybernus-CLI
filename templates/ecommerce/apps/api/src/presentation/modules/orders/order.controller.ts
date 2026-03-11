import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { orderService } from '../../../infrastructure/config/registry/orders.registry';
import type { OrderStatus } from '../../../domain/checkout/order.entity';

// ── Zod schemas ───────────────────────────────────────────────────────────────
const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingCode: z.string().optional(),
});

const statusFilterSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

function serializeOrder(order: { toRecord: () => object }) {
  return order.toRecord();
}

// ── Customer controllers ──────────────────────────────────────────────────────
export async function listOrders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user as { id: string };
    const { cursor, limit } = paginationSchema.parse(req.query);
    const result = await orderService.getOrdersByUser(user.id, { cursor, limit });
    res.status(200).json({
      items: result.items.map(serializeOrder),
      nextCursor: result.nextCursor,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user as { id: string };
    const { id } = req.params as { id: string };
    const order = await orderService.getOrderById(id, user.id);
    res.status(200).json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
}

// ── Admin controllers ─────────────────────────────────────────────────────────
export async function adminListOrders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { status, cursor, limit } = statusFilterSchema.parse(req.query);
    const result = await orderService.getAllOrders({
      status: status as OrderStatus | undefined,
      cursor,
      limit,
    });
    res.status(200).json({
      items: result.items.map(serializeOrder),
      nextCursor: result.nextCursor,
    });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { status, trackingCode } = updateStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(id, status, trackingCode);
    res.status(200).json(serializeOrder(order));
  } catch (err) {
    next(err);
  }
}
