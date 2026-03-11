import { CouponEntity } from '../../../domain/cart/coupon.entity';
import type { ICouponRepository } from '../../../domain/cart/coupon.repository';

export class InMemoryCouponRepository implements ICouponRepository {
  private store = new Map<string, CouponEntity>();

  async findByCode(code: string): Promise<CouponEntity | null> {
    return this.store.get(code.toUpperCase()) ?? null;
  }

  async findById(id: string): Promise<CouponEntity | null> {
    for (const coupon of this.store.values()) {
      if (coupon.id === id) return coupon;
    }
    return null;
  }

  async findAll(): Promise<CouponEntity[]> {
    return [...this.store.values()];
  }

  async save(coupon: CouponEntity): Promise<CouponEntity> {
    this.store.set(coupon.code.toUpperCase(), coupon);
    return coupon;
  }

  async deleteById(id: string): Promise<void> {
    for (const [key, coupon] of this.store.entries()) {
      if (coupon.id === id) {
        this.store.delete(key);
        return;
      }
    }
  }

  async incrementUsage(code: string): Promise<void> {
    const coupon = this.store.get(code.toUpperCase());
    if (!coupon) return;
    const props = coupon.toRecord();
    const updated = CouponEntity.reconstitute({
      ...props,
      usageCount: props.usageCount + 1,
    });
    this.store.set(code.toUpperCase(), updated);
  }

  // ── Test / seeding helpers ────────────────────────────────────────────────
  seed(coupon: CouponEntity): void {
    this.store.set(coupon.code.toUpperCase(), coupon);
  }

  clear(): void {
    this.store.clear();
  }
}
