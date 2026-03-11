import { AppError } from '../../domain/shared/AppError';
import { OrderEntity } from '../../domain/checkout/order.entity';
import type { OrderStatus } from '../../domain/checkout/order.entity';
import { IOrderRepository } from '../../domain/checkout/order.repository';
import { IEmailService } from '../ports/email.port';
import { IUserRepository } from '../../domain/auth/user.repository';

export class OrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly emailService?: IEmailService,
    private readonly userRepo?: IUserRepository,
  ) {}

  async getOrdersByUser(
    userId: string,
    opts?: { cursor?: string; limit?: number },
  ): Promise<{ items: OrderEntity[]; nextCursor: string | null }> {
    return this.orderRepo.findByUserId(userId, opts);
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderEntity> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new AppError('Pedido não encontrado', 404);
    if (order.userId !== userId) throw new AppError('Acesso negado', 403);
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    trackingCode?: string,
  ): Promise<OrderEntity> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new AppError('Pedido não encontrado', 404);

    let updated: OrderEntity;
    switch (newStatus) {
      case 'PAID':
        updated = order.pay();
        break;
      case 'FAILED':
        updated = order.fail();
        break;
      case 'SHIPPED':
        updated = order.ship(trackingCode);
        break;
      case 'DELIVERED':
        updated = order.deliver();
        break;
      case 'CANCELLED':
        updated = order.cancel();
        break;
      default:
        throw new AppError(`Status desconhecido: ${newStatus}`, 400);
    }

    const saved = await this.orderRepo.update(updated);
    await this._sendStatusEmail(saved, newStatus);
    return saved;
  }

  private async _sendStatusEmail(order: OrderEntity, status: OrderStatus): Promise<void> {
    if (!this.emailService || !this.userRepo) return;
    if (status !== 'SHIPPED' && status !== 'DELIVERED') return;
    try {
      const user = await this.userRepo.findById(order.userId);
      if (!user) return;
      if (status === 'SHIPPED') {
        const html = `
          <h2>Seu pedido foi enviado! 🚚</h2>
          <p>Olá ${user.name}, seu pedido <strong>#${order.id.slice(0, 8)}</strong> está a caminho.</p>
          <p>Código de rastreio: <strong>${order.trackingCode ?? '—'}</strong></p>
        `;
        await this.emailService.send(user.email, 'Pedido enviado 🚚', html);
      } else {
        const html = `
          <h2>Pedido entregue! ✅</h2>
          <p>Olá ${user.name}, seu pedido <strong>#${order.id.slice(0, 8)}</strong> foi entregue. Aproveite!</p>
        `;
        await this.emailService.send(user.email, 'Pedido entregue ✅', html);
      }
    } catch {
      // Email failure must never break the order update flow
    }
  }

  async getAllOrders(
    opts?: { status?: OrderStatus; cursor?: string; limit?: number },
  ): Promise<{ items: OrderEntity[]; nextCursor: string | null }> {
    return this.orderRepo.findAll(opts);
  }
}
