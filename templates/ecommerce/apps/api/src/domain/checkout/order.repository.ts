import { OrderEntity } from './order.entity';
import type { OrderStatus } from './order.entity';

export interface IOrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  findByPaymentIntentId(paymentIntentId: string): Promise<OrderEntity | null>;
  findByUserId(userId: string, opts?: { cursor?: string; limit?: number }): Promise<{ items: OrderEntity[]; nextCursor: string | null }>;
  findAll(opts?: { status?: OrderStatus; cursor?: string; limit?: number }): Promise<{ items: OrderEntity[]; nextCursor: string | null }>;
  create(order: OrderEntity): Promise<OrderEntity>;
  update(order: OrderEntity): Promise<OrderEntity>;
}
