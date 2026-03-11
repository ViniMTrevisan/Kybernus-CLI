import { z } from 'zod';
import { AppError } from '../../domain/shared/AppError';
import { CouponEntity, DiscountType } from '../../domain/cart/coupon.entity';
import { ICouponRepository } from '../../domain/cart/coupon.repository';

// ── Validation schema ─────────────────────────────────────────────────────────
export const createCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  discountType: z.enum(['percent', 'fixed'] as [DiscountType, ...DiscountType[]]),
  discountValue: z.number().positive({ message: 'discountValue must be > 0' }),
  minOrderValue: z.number().min(0).default(0),
  usageLimit: z.number().int().positive().nullable().default(null),
  expiresAt: z
    .string()
    .datetime()
    .nullable()
    .optional()
    .transform((v) => (v ? new Date(v) : null))
    .default(null),
});

export type CreateCouponDTO = z.infer<typeof createCouponSchema>;

// ── CouponAdminService ────────────────────────────────────────────────────────
export class CouponAdminService {
  constructor(private readonly couponRepo: ICouponRepository) {}

  async create(dto: CreateCouponDTO): Promise<CouponEntity> {
    const existing = await this.couponRepo.findByCode(dto.code);
    if (existing) {
      throw new AppError(`Coupon code "${dto.code}" already exists`, 409);
    }
    const coupon = CouponEntity.create({
      code: dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderValue: dto.minOrderValue,
      usageLimit: dto.usageLimit ?? null,
      expiresAt: dto.expiresAt ?? null,
    });
    return this.couponRepo.save(coupon);
  }

  async list(): Promise<CouponEntity[]> {
    return this.couponRepo.findAll();
  }

  async delete(id: string): Promise<void> {
    await this.couponRepo.deleteById(id);
  }
}
