import { InMemoryCartRepository } from '../../persistence/in-memory/cart.memory.repository';
import { InMemoryCouponRepository } from '../../persistence/in-memory/coupon.memory.repository';
import { MockShippingService } from '../../services/shipping/mock.shipping.service';
import { CouponEntity } from '../../../domain/cart/coupon.entity';
import { CartService } from '../../../application/cart/cart.service';
import { productRepository } from './catalog.registry';

// ── Singletons ────────────────────────────────────────────────────────────────
export const cartRepository = new InMemoryCartRepository();
export const couponRepository = new InMemoryCouponRepository();
export const shippingService = new MockShippingService();
export const cartService = new CartService(
  cartRepository,
  couponRepository,
  shippingService,
  productRepository,
);

// ── Seed test coupons ─────────────────────────────────────────────────────────
couponRepository.seed(
  CouponEntity.reconstitute({
    id: 'seed-coup-1',
    code: 'PROMO10',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 0,
    usageLimit: null,
    usageCount: 0,
    expiresAt: null,
    createdAt: new Date(),
  }),
);

couponRepository.seed(
  CouponEntity.reconstitute({
    id: 'seed-coup-2',
    code: 'EXPIRED',
    discountType: 'percent',
    discountValue: 5,
    minOrderValue: 0,
    usageLimit: null,
    usageCount: 0,
    expiresAt: new Date('2020-01-01'),
    createdAt: new Date(),
  }),
);

// ── Named export for test setup ───────────────────────────────────────────────
export const cartRegistry = { cartRepository, couponRepository, shippingService, cartService };
