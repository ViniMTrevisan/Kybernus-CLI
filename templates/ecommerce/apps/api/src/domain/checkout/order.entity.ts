import { AppError } from '../shared/AppError';

// ── Types ─────────────────────────────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemProps {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image: string | null;
}

export interface OrderProps {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemProps[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode: string | null;
  paymentIntentId: string | null;
  trackingCode: string | null;
  shippingAddress: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateOrderInput = Pick<
  OrderProps,
  'userId' | 'items' | 'subtotal' | 'discount' | 'shippingCost' | 'tax' | 'total' | 'couponCode' | 'paymentIntentId' | 'shippingAddress'
>;

// ── Valid status transitions ───────────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING:   ['PAID', 'FAILED', 'CANCELLED'],
  PAID:      ['SHIPPED', 'CANCELLED'],
  SHIPPED:   ['DELIVERED'],
  FAILED:    [],
  DELIVERED: [],
  CANCELLED: [],
};

// ── OrderEntity ───────────────────────────────────────────────────────────────
export class OrderEntity {
  private constructor(private readonly props: OrderProps) {}

  // ── Factory ───────────────────────────────────────────────────────────────
  static create(input: CreateOrderInput): OrderEntity {
    return new OrderEntity({
      id: crypto.randomUUID(),
      status: 'PENDING',
      trackingCode: null,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: OrderProps): OrderEntity {
    return new OrderEntity({ ...props });
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get status(): OrderStatus { return this.props.status; }
  get items(): ReadonlyArray<OrderItemProps> { return this.props.items; }
  get subtotal(): number { return this.props.subtotal; }
  get discount(): number { return this.props.discount; }
  get shippingCost(): number { return this.props.shippingCost; }
  get tax(): number { return this.props.tax; }
  get total(): number { return this.props.total; }
  get couponCode(): string | null { return this.props.couponCode; }
  get paymentIntentId(): string | null { return this.props.paymentIntentId; }
  get trackingCode(): string | null { return this.props.trackingCode; }
  get shippingAddress(): Record<string, string> | null { return this.props.shippingAddress; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // ── State transitions (immutable) ─────────────────────────────────────────
  private transition(to: OrderStatus): OrderEntity {
    const allowed = ALLOWED_TRANSITIONS[this.props.status] ?? [];
    if (!allowed.includes(to)) {
      throw new AppError(
        `Transição inválida: ${this.props.status} → ${to}`,
        400,
      );
    }
    return new OrderEntity({ ...this.props, status: to, updatedAt: new Date() });
  }

  pay(): OrderEntity { return this.transition('PAID'); }
  fail(): OrderEntity { return this.transition('FAILED'); }
  ship(trackingCode?: string): OrderEntity {
    const next = this.transition('SHIPPED');
    if (trackingCode) return new OrderEntity({ ...next.props, trackingCode, updatedAt: new Date() });
    return next;
  }
  deliver(): OrderEntity { return this.transition('DELIVERED'); }
  cancel(): OrderEntity { return this.transition('CANCELLED'); }

  withPaymentIntentId(id: string): OrderEntity {
    return new OrderEntity({ ...this.props, paymentIntentId: id, updatedAt: new Date() });
  }

  withTrackingCode(code: string): OrderEntity {
    return new OrderEntity({ ...this.props, trackingCode: code, updatedAt: new Date() });
  }

  // ── Serialization ─────────────────────────────────────────────────────────
  toRecord(): OrderProps {
    return { ...this.props, items: [...this.props.items] };
  }
}
