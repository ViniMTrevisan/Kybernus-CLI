// ── Types ─────────────────────────────────────────────────────────────────────
export type DiscountType = 'percent' | 'fixed';

export interface CouponProps {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  createdAt: Date;
}

// ── CouponEntity ──────────────────────────────────────────────────────────────
export class CouponEntity {
  private constructor(private readonly props: CouponProps) {}

  static create(input: Omit<CouponProps, 'id' | 'usageCount' | 'createdAt'>): CouponEntity {
    return new CouponEntity({
      ...input,
      id: crypto.randomUUID(),
      usageCount: 0,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: CouponProps): CouponEntity {
    return new CouponEntity({ ...props });
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  get id(): string { return this.props.id; }
  get code(): string { return this.props.code; }
  get discountType(): DiscountType { return this.props.discountType; }
  get discountValue(): number { return this.props.discountValue; }
  get minOrderValue(): number { return this.props.minOrderValue; }
  get usageLimit(): number | null { return this.props.usageLimit; }
  get usageCount(): number { return this.props.usageCount; }
  get expiresAt(): Date | null { return this.props.expiresAt; }

  // ── Business rules ────────────────────────────────────────────────────────
  isExpired(): boolean {
    if (!this.props.expiresAt) return false;
    return this.props.expiresAt < new Date();
  }

  isUsageLimitReached(): boolean {
    if (this.props.usageLimit === null) return false;
    return this.props.usageCount >= this.props.usageLimit;
  }

  // ── Serialization ─────────────────────────────────────────────────────────
  toRecord(): CouponProps {
    return { ...this.props };
  }
}
