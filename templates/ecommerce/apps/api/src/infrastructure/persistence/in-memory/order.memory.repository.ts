import { OrderEntity } from '../../../domain/checkout/order.entity';
import type { OrderStatus } from '../../../domain/checkout/order.entity';
import type { IOrderRepository } from '../../../domain/checkout/order.repository';

export class InMemoryOrderRepository implements IOrderRepository {
  private store = new Map<string, OrderEntity>();

  async findById(id: string): Promise<OrderEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<OrderEntity | null> {
    for (const order of this.store.values()) {
      if (order.paymentIntentId === paymentIntentId) return order;
    }
    return null;
  }

  async findByUserId(
    userId: string,
    opts: { cursor?: string; limit?: number } = {},
  ): Promise<{ items: OrderEntity[]; nextCursor: string | null }> {
    const limit = opts.limit ?? 20;
    const all = [...this.store.values()]
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    let startIdx = 0;
    if (opts.cursor) {
      const idx = all.findIndex((o) => o.id === opts.cursor);
      if (idx !== -1) startIdx = idx + 1;
    }

    const page = all.slice(startIdx, startIdx + limit);
    const nextCursor = all.length > startIdx + limit ? page[page.length - 1]!.id : null;
    return { items: page, nextCursor };
  }

  async create(order: OrderEntity): Promise<OrderEntity> {
    this.store.set(order.id, order);
    return order;
  }

  async update(order: OrderEntity): Promise<OrderEntity> {
    this.store.set(order.id, order);
    return order;
  }

  async findAll(
    opts: { status?: OrderStatus; cursor?: string; limit?: number } = {},
  ): Promise<{ items: OrderEntity[]; nextCursor: string | null }> {
    const limit = opts.limit ?? 20;
    let all = [...this.store.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (opts.status) {
      all = all.filter((o) => o.status === opts.status);
    }

    let startIdx = 0;
    if (opts.cursor) {
      const idx = all.findIndex((o) => o.id === opts.cursor);
      if (idx !== -1) startIdx = idx + 1;
    }

    const page = all.slice(startIdx, startIdx + limit);
    const nextCursor = all.length > startIdx + limit ? page[page.length - 1]!.id : null;
    return { items: page, nextCursor };
  }

  /** Test helper */
  clear(): void {
    this.store.clear();
  }
}
