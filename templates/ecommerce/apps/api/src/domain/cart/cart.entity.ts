import { AppError } from '../shared/AppError';
import type { CouponEntity } from './coupon.entity';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CartItemProps {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image: string | null;
}

export interface CartProps {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItemProps[];
  coupon: CouponEntity | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── CartEntity ────────────────────────────────────────────────────────────────
export class CartEntity {
  private constructor(private readonly props: CartProps) {}

  // ── Factory ───────────────────────────────────────────────────────────────
  static create(userId: string | null, sessionId?: string | null): CartEntity {
    return new CartEntity({
      id: crypto.randomUUID(),
      userId: userId ?? null,
      sessionId: sessionId ?? null,
      items: [],
      coupon: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: CartProps): CartEntity {
    return new CartEntity({ ...props });
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  get id(): string { return this.props.id; }
  get userId(): string | null { return this.props.userId; }
  get sessionId(): string | null { return this.props.sessionId; }
  get items(): ReadonlyArray<CartItemProps> { return this.props.items; }
  get coupon(): CouponEntity | null { return this.props.coupon; }
  get createdAt(): Date { return this.props.createdAt; }

  get subtotal(): number {
    return this.props.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  get discount(): number {
    if (!this.props.coupon) return 0;
    const coupon = this.props.coupon;
    if (coupon.discountType === 'percent') {
      return Math.round(this.subtotal * coupon.discountValue) / 100;
    }
    return Math.min(coupon.discountValue, this.subtotal);
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discount);
  }

  // ── Operations (immutable) ────────────────────────────────────────────────
  addItem(item: CartItemProps): CartEntity {
    const existing = this.props.items.find((i) => i.variantId === item.variantId);
    let newItems: CartItemProps[];
    if (existing) {
      newItems = this.props.items.map((i) =>
        i.variantId === item.variantId ? { ...i, qty: i.qty + item.qty } : i,
      );
    } else {
      newItems = [...this.props.items, { ...item }];
    }
    return new CartEntity({ ...this.props, items: newItems, updatedAt: new Date() });
  }

  updateItem(variantId: string, qty: number): CartEntity {
    if (qty <= 0) {
      return this.removeItem(variantId);
    }
    const newItems = this.props.items.map((i) =>
      i.variantId === variantId ? { ...i, qty } : i,
    );
    return new CartEntity({ ...this.props, items: newItems, updatedAt: new Date() });
  }

  removeItem(variantId: string): CartEntity {
    const newItems = this.props.items.filter((i) => i.variantId !== variantId);
    return new CartEntity({ ...this.props, items: newItems, updatedAt: new Date() });
  }

  applyCoupon(coupon: CouponEntity): CartEntity {
    if (coupon.isExpired()) {
      throw new AppError('Cupom expirado', 400);
    }
    if (this.subtotal < coupon.minOrderValue) {
      throw new AppError(
        `Valor mínimo para este cupom é R$${coupon.minOrderValue.toFixed(2)}`,
        400,
      );
    }
    return new CartEntity({ ...this.props, coupon, updatedAt: new Date() });
  }

  removeCoupon(): CartEntity {
    return new CartEntity({ ...this.props, coupon: null, updatedAt: new Date() });
  }

  withUserId(userId: string): CartEntity {
    return new CartEntity({ ...this.props, userId, updatedAt: new Date() });
  }

  // ── Serialization ─────────────────────────────────────────────────────────
  toRecord() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      sessionId: this.props.sessionId,
      items: [...this.props.items],
      couponCode: this.props.coupon?.code ?? null,
      subtotal: this.subtotal,
      discount: this.discount,
      total: this.total,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
