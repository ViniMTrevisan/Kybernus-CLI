/**
 * Order Entity — State Machine Unit Tests (Phase 5)
 */
import { OrderEntity } from '../../checkout/order.entity';

function makeOrder() {
  return OrderEntity.create({
    userId: 'user-1',
    items: [],
    subtotal: 100,
    discount: 0,
    shippingCost: 10,
    tax: 0,
    total: 110,
    couponCode: null,
    paymentIntentId: null,
    shippingAddress: null,
  });
}

describe('Order Entity — State Machine', () => {
  it('estado inicial deve ser PENDING', () => {
    const order = makeOrder();
    expect(order.status).toBe('PENDING');
  });

  it('PENDING → PAID: deve ser permitido', () => {
    const order = makeOrder().pay();
    expect(order.status).toBe('PAID');
  });

  it('PENDING → SHIPPED: deve lançar InvalidTransitionError', () => {
    const order = makeOrder();
    expect(() => order.ship()).toThrow();
  });

  it('PAID → SHIPPED: deve ser permitido', () => {
    const order = makeOrder().pay().ship();
    expect(order.status).toBe('SHIPPED');
  });

  it('SHIPPED → DELIVERED: deve ser permitido', () => {
    const order = makeOrder().pay().ship().deliver();
    expect(order.status).toBe('DELIVERED');
  });

  it('PENDING → CANCELLED: deve ser permitido', () => {
    const order = makeOrder().cancel();
    expect(order.status).toBe('CANCELLED');
  });

  it('DELIVERED → CANCELLED: deve lançar InvalidTransitionError', () => {
    const order = makeOrder().pay().ship().deliver();
    expect(() => order.cancel()).toThrow();
  });

  it('deve registrar timestamp de cada transição de estado', () => {
    const before = new Date();
    const order = makeOrder().pay();
    expect(order.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('deve aceitar trackingCode ao transicionar para SHIPPED', () => {
    const order = makeOrder().pay().ship('TRACK-001');
    expect(order.status).toBe('SHIPPED');
    expect(order.trackingCode).toBe('TRACK-001');
  });
});
