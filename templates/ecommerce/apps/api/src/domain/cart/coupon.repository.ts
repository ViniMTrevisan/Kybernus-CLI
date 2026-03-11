import { CouponEntity } from './coupon.entity';

export interface ICouponRepository {
  findByCode(code: string): Promise<CouponEntity | null>;
  findById(id: string): Promise<CouponEntity | null>;
  findAll(): Promise<CouponEntity[]>;
  save(coupon: CouponEntity): Promise<CouponEntity>;
  deleteById(id: string): Promise<void>;
  incrementUsage(code: string): Promise<void>;
}
