import type { PrismaClient, Order, OrderItem } from '@prisma/client';
import { OrderEntity } from '../../../../domain/checkout/order.entity';
import type { IOrderRepository } from '../../../../domain/checkout/order.repository';
import type { OrderStatus } from '../../../../domain/checkout/order.entity';

type OrderWithItems = Order & { items: OrderItem[] };

function toEntity(row: OrderWithItems): OrderEntity {
  return OrderEntity.reconstitute({
    id: row.id,
    userId: row.userId,
    status: row.status as OrderStatus,
    items: row.items.map((i) => ({
      id: i.id,
      variantId: i.variantId,
      productId: i.productId,
      name: i.name,
      sku: i.sku,
      price: Number(i.price),
      qty: i.qty,
      image: i.image,
    })),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shippingCost: Number(row.shippingCost),
    tax: Number(row.tax),
    total: Number(row.total),
    couponCode: row.couponCode,
    paymentIntentId: row.paymentIntentId,
    trackingCode: row.trackingCode,
    shippingAddress: row.shippingAddress as Record<string, string> | null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

const INCLUDE_ITEMS = { items: true } as const;

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<OrderEntity | null> {
    const row = await this.db.order.findUnique({
      where: { id },
      include: INCLUDE_ITEMS,
    });
    return row ? toEntity(row) : null;
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<OrderEntity | null> {
    const row = await this.db.order.findUnique({
      where: { paymentIntentId },
      include: INCLUDE_ITEMS,
    });
    return row ? toEntity(row) : null;
  }

  async findByUserId(
    userId: string,
    opts: { cursor?: string; limit?: number } = {},
  ): Promise<{ items: OrderEntity[]; nextCursor: string | null }> {
    const limit = opts.limit ?? 20;

    const rows = await this.db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: INCLUDE_ITEMS,
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]!.id : null;

    return { items: items.map(toEntity), nextCursor };
  }

  async findAll(
    opts: { status?: OrderStatus; cursor?: string; limit?: number } = {},
  ): Promise<{ items: OrderEntity[]; nextCursor: string | null }> {
    const limit = opts.limit ?? 20;

    const rows = await this.db.order.findMany({
      where: opts.status ? { status: opts.status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: INCLUDE_ITEMS,
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]!.id : null;

    return { items: items.map(toEntity), nextCursor };
  }

  async create(order: OrderEntity): Promise<OrderEntity> {
    const row = await this.db.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingCost: order.shippingCost,
        tax: order.tax,
        total: order.total,
        couponCode: order.couponCode,
        paymentIntentId: order.paymentIntentId,
        trackingCode: order.trackingCode,
        shippingAddress: order.shippingAddress ?? undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: {
          createMany: {
            data: order.items.map((i) => ({
              id: i.id,
              variantId: i.variantId,
              productId: i.productId,
              name: i.name,
              sku: i.sku,
              price: i.price,
              qty: i.qty,
              image: i.image,
            })),
          },
        },
      },
      include: INCLUDE_ITEMS,
    });
    return toEntity(row);
  }

  async update(order: OrderEntity): Promise<OrderEntity> {
    const row = await this.db.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        paymentIntentId: order.paymentIntentId,
        trackingCode: order.trackingCode,
        shippingAddress: order.shippingAddress ?? undefined,
      },
      include: INCLUDE_ITEMS,
    });
    return toEntity(row);
  }
}
