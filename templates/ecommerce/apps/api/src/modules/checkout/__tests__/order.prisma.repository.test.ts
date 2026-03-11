import { PrismaClient } from '@prisma/client';
import { PrismaOrderRepository } from '../order.prisma.repository';
import { OrderEntity } from '../order.entity';

const db = new PrismaClient();
const repo = new PrismaOrderRepository(db);

async function cleanDb() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
}

beforeAll(async () => {
  await db.$connect();
});

afterAll(async () => {
  await cleanDb();
  await db.$disconnect();
});

beforeEach(async () => {
  await cleanDb();
});

function makeOrder(userId = 'user-123') {
  return OrderEntity.create({
    userId,
    items: [
      {
        id: crypto.randomUUID(),
        variantId: 'variant-1',
        productId: 'product-1',
        name: 'Test Product',
        sku: 'SKU-001',
        price: 50.0,
        qty: 2,
        image: null,
      },
    ],
    subtotal: 100.0,
    discount: 0,
    shippingCost: 10.0,
    tax: 5.0,
    total: 115.0,
    couponCode: null,
    paymentIntentId: null,
    shippingAddress: { line1: '123 Main St', city: 'São Paulo', country: 'BR' },
  });
}

describe('PrismaOrderRepository', () => {
  it('create: deve persistir pedido com itens', async () => {
    const order = makeOrder();
    const saved = await repo.create(order);

    expect(saved.id).toBe(order.id);
    expect(saved.status).toBe('PENDING');
    expect(saved.total).toBe(115.0);
    expect(saved.items).toHaveLength(1);
    expect(saved.items[0]!.sku).toBe('SKU-001');
  });

  it('findById: deve retornar null para id inexistente', async () => {
    const found = await repo.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeNull();
  });

  it('findById: deve reconstituir pedido com itens', async () => {
    const order = makeOrder();
    await repo.create(order);

    const found = await repo.findById(order.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(order.id);
    expect(found!.items).toHaveLength(1);
    expect(found!.shippingAddress).toEqual({
      line1: '123 Main St',
      city: 'São Paulo',
      country: 'BR',
    });
  });

  it('findByPaymentIntentId: deve retornar pedido pelo paymentIntentId', async () => {
    const order = makeOrder().withPaymentIntentId('pi_test_abc123');
    await repo.create(order);

    const found = await repo.findByPaymentIntentId('pi_test_abc123');
    expect(found).not.toBeNull();
    expect(found!.paymentIntentId).toBe('pi_test_abc123');
  });

  it('update: deve persistir mudança de status', async () => {
    const order = makeOrder();
    await repo.create(order);

    const paid = order.pay();
    await repo.update(paid);

    const fetched = await repo.findById(order.id);
    expect(fetched!.status).toBe('PAID');
  });

  it('findByUserId: deve retornar pedidos do usuário com paginação', async () => {
    const userId = 'user-pagination-test';
    await Promise.all([
      repo.create(makeOrder(userId)),
      repo.create(makeOrder(userId)),
      repo.create(makeOrder(userId)),
    ]);

    const page1 = await repo.findByUserId(userId, { limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await repo.findByUserId(userId, {
      cursor: page1.nextCursor!,
      limit: 2,
    });
    expect(page2.items).toHaveLength(1);
    expect(page2.nextCursor).toBeNull();
  });

  it('findAll: deve filtrar por status', async () => {
    const o1 = makeOrder();
    const o2 = makeOrder();
    await repo.create(o1);
    await repo.create(o2);
    await repo.update(o1.pay());

    const { items } = await repo.findAll({ status: 'PAID' });
    expect(items).toHaveLength(1);
    expect(items[0]!.status).toBe('PAID');
  });

  it('update: deve persistir trackingCode no pedido enviado', async () => {
    const order = makeOrder().withPaymentIntentId('pi_track_test');
    await repo.create(order);

    const paid = order.pay();
    await repo.update(paid);

    const shipped = paid.ship('TRACK-001');
    await repo.update(shipped);

    const fetched = await repo.findById(order.id);
    expect(fetched!.status).toBe('SHIPPED');
    expect(fetched!.trackingCode).toBe('TRACK-001');
  });
});
