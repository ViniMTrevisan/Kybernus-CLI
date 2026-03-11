import { CartEntity } from '../cart.entity';
import { CouponEntity } from '../coupon.entity';

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeItem(overrides: Partial<{
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image: string | null;
}> = {}) {
  return {
    variantId: overrides.variantId ?? 'var-1',
    productId: overrides.productId ?? 'prod-1',
    name: overrides.name ?? 'Camiseta Básica',
    sku: overrides.sku ?? 'CAM-P',
    price: overrides.price ?? 100,
    qty: overrides.qty ?? 1,
    image: overrides.image ?? null,
  };
}

// Coupon helpers
const percentCoupon = CouponEntity.reconstitute({
  id: 'coup-1',
  code: 'PROMO10',
  discountType: 'percent',
  discountValue: 10, // 10%
  minOrderValue: 0,
  usageLimit: null,
  usageCount: 0,
  expiresAt: null,
  createdAt: new Date(),
});

const fixedCoupon = CouponEntity.reconstitute({
  id: 'coup-2',
  code: 'FIXO20',
  discountType: 'fixed',
  discountValue: 20,
  minOrderValue: 0,
  usageLimit: null,
  usageCount: 0,
  expiresAt: null,
  createdAt: new Date(),
});

const expiredCoupon = CouponEntity.reconstitute({
  id: 'coup-3',
  code: 'OLD',
  discountType: 'percent',
  discountValue: 5,
  minOrderValue: 0,
  usageLimit: null,
  usageCount: 0,
  expiresAt: new Date('2020-01-01'), // past
  createdAt: new Date(),
});

const highMinCoupon = CouponEntity.reconstitute({
  id: 'coup-4',
  code: 'BIG500',
  discountType: 'percent',
  discountValue: 20,
  minOrderValue: 500,
  usageLimit: null,
  usageCount: 0,
  expiresAt: null,
  createdAt: new Date(),
});

describe('CartEntity — Unit (pure domain)', () => {
  let emptyCart: CartEntity;

  beforeEach(() => {
    emptyCart = CartEntity.create('user-1');
  });

  it('deve adicionar item ao carrinho', () => {
    const cart = emptyCart.addItem(makeItem());
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.variantId).toBe('var-1');
    expect(cart.items[0]!.qty).toBe(1);
  });

  it('deve incrementar quantidade se produto já existir', () => {
    const cart = emptyCart.addItem(makeItem({ qty: 2 })).addItem(makeItem({ qty: 3 }));
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.qty).toBe(5);
  });

  it('deve remover item pelo variantId', () => {
    const cart = emptyCart
      .addItem(makeItem({ variantId: 'var-1' }))
      .addItem(makeItem({ variantId: 'var-2', sku: 'CAM-G' }))
      .removeItem('var-1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]!.variantId).toBe('var-2');
  });

  it('deve calcular subtotal corretamente', () => {
    const cart = emptyCart
      .addItem(makeItem({ price: 100, qty: 2 }))
      .addItem(makeItem({ variantId: 'var-2', sku: 'CALCA-M', price: 150, qty: 1 }));
    expect(cart.subtotal).toBe(350);
  });

  it('deve calcular total com desconto de cupom percentual', () => {
    const cart = emptyCart
      .addItem(makeItem({ price: 200, qty: 1 }))
      .applyCoupon(percentCoupon); // 10% de 200 = 20
    expect(cart.discount).toBe(20);
    expect(cart.total).toBe(180);
  });

  it('deve calcular total com desconto de cupom de valor fixo', () => {
    const cart = emptyCart
      .addItem(makeItem({ price: 200, qty: 1 }))
      .applyCoupon(fixedCoupon); // R$20 fixo
    expect(cart.discount).toBe(20);
    expect(cart.total).toBe(180);
  });

  it('deve rejeitar cupom expirado', () => {
    expect(() => emptyCart.addItem(makeItem({ price: 100 })).applyCoupon(expiredCoupon))
      .toThrow('Cupom expirado');
  });

  it('deve rejeitar cupom com valor mínimo não atingido', () => {
    expect(() => emptyCart.addItem(makeItem({ price: 100 })).applyCoupon(highMinCoupon))
      .toThrow('Valor mínimo');
  });

  it('deve ser imutável — cada operação retorna novo Cart', () => {
    const cart1 = emptyCart.addItem(makeItem());
    const cart2 = cart1.addItem(makeItem({ variantId: 'var-2', sku: 'X' }));
    expect(cart1.items).toHaveLength(1);
    expect(cart2.items).toHaveLength(2);
    // original not mutated
    expect(emptyCart.items).toHaveLength(0);
  });
});
