/**
 * OrderService — Email de status (Phase 14)
 * Verifica que emails são enviados nas transições SHIPPED e DELIVERED
 * e que falhas de email não quebram o fluxo.
 */

import { OrderService } from '../order.service';
import { IOrderRepository } from '../../checkout/order.repository';
import { IEmailService } from '../../../shared/infra/email/IEmailService';
import { IUserRepository } from '../../auth/user.repository';
import { OrderEntity } from '../../checkout/order.entity';
import { UserEntity } from '../../auth/user.entity';

function makeOrderRepo(): jest.Mocked<IOrderRepository> {
  return {
    findById: jest.fn(),
    findByPaymentIntentId: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn().mockImplementation(async (o: OrderEntity) => o),
  } as jest.Mocked<IOrderRepository>;
}

function makeEmailService(): jest.Mocked<IEmailService> {
  return { send: jest.fn().mockResolvedValue(undefined) };
}

function makeUserRepo(): jest.Mocked<IUserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  } as jest.Mocked<IUserRepository>;
}

function makePaidOrder(overrides: Partial<{ userId: string }> = {}): OrderEntity {
  return OrderEntity.reconstitute({
    id: 'order-email-1',
    userId: overrides.userId ?? 'user-email-1',
    status: 'PAID',
    items: [{ id: 'i1', variantId: 'v1', productId: 'p1', name: 'Tênis', sku: 'TN-42', price: 299.9, qty: 1, image: null }],
    subtotal: 299.9,
    discount: 0,
    shippingCost: 20,
    tax: 0,
    total: 319.9,
    couponCode: null,
    paymentIntentId: 'pi_abc',
    trackingCode: null,
    shippingAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeUser(email = 'user@test.com'): UserEntity {
  return UserEntity.create({ name: 'Usuário', email, passwordHash: 'h', role: 'CUSTOMER' });
}

describe('OrderService — emails de status (Phase 14)', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let userRepo: jest.Mocked<IUserRepository>;
  let service: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    orderRepo = makeOrderRepo();
    emailService = makeEmailService();
    userRepo = makeUserRepo();
    service = new OrderService(orderRepo, emailService, userRepo);
  });

  it('envia email "Pedido enviado" com trackingCode ao mudar status para SHIPPED', async () => {
    const order = makePaidOrder({ userId: 'u-shipped' });
    orderRepo.findById.mockResolvedValue(order);
    userRepo.findById.mockResolvedValue(makeUser('shipped@test.com'));

    await service.updateOrderStatus('order-email-1', 'SHIPPED', 'TRACK123');

    expect(emailService.send).toHaveBeenCalledWith(
      'shipped@test.com',
      expect.stringContaining('enviado'),
      expect.stringContaining('TRACK123'),
    );
  });

  it('envia email "Pedido entregue" ao mudar status para DELIVERED', async () => {
    const shipped = OrderEntity.reconstitute({
      ...makePaidOrder({ userId: 'u-delivered' }).toRecord(),
      status: 'SHIPPED',
      trackingCode: 'TR999',
    });
    orderRepo.findById.mockResolvedValue(shipped);
    userRepo.findById.mockResolvedValue(makeUser('delivered@test.com'));

    await service.updateOrderStatus('order-email-1', 'DELIVERED');

    expect(emailService.send).toHaveBeenCalledWith(
      'delivered@test.com',
      expect.stringContaining('entregue'),
      expect.any(String),
    );
  });

  it('não envia email ao mudar status para CANCELLED', async () => {
    const order = makePaidOrder();
    orderRepo.findById.mockResolvedValue(order);

    await service.updateOrderStatus('order-email-1', 'CANCELLED');

    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('não envia email para transição PENDING→PAID (coberto pelo webhook)', async () => {
    const pending = OrderEntity.reconstitute({
      ...makePaidOrder().toRecord(),
      status: 'PENDING',
    });
    orderRepo.findById.mockResolvedValue(pending);

    await service.updateOrderStatus('order-email-1', 'PAID');

    expect(emailService.send).not.toHaveBeenCalled();
  });

  it('não falha se emailService.send() lançar na transição SHIPPED', async () => {
    const order = makePaidOrder({ userId: 'u-err' });
    orderRepo.findById.mockResolvedValue(order);
    userRepo.findById.mockResolvedValue(makeUser('err@test.com'));
    emailService.send.mockRejectedValue(new Error('SMTP timeout'));

    // Must NOT throw
    await expect(service.updateOrderStatus('order-email-1', 'SHIPPED', 'TR-X')).resolves.toBeDefined();
    // Order must still have been updated
    expect(orderRepo.update).toHaveBeenCalled();
  });
});
