import type { IOrderRepository } from '../../domain/checkout/order.repository';
import type { OrderStatus } from '../../domain/checkout/order.entity';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface StatsResult {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalQty: number;
  totalRevenue: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const REVENUE_STATUSES: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED'];

function buildRange(
  period?: string,
  from?: string,
  to?: string,
): { start: Date; end: Date } | null {
  if (!period) return null;
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { start, end: now };
  }
  if (period === 'month') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { start, end: now };
  }
  if (period === 'custom' && from && to) {
    return { start: new Date(from), end: new Date(to) };
  }
  return null;
}

// ── DashboardService ──────────────────────────────────────────────────────────
export class DashboardService {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async getStats(
    opts: { period?: string; from?: string; to?: string } = {},
  ): Promise<StatsResult> {
    const { items: all } = await this.orderRepo.findAll({ limit: 10_000 });
    const range = buildRange(opts.period, opts.from, opts.to);
    const orders = range
      ? all.filter((o) => o.createdAt >= range.start && o.createdAt <= range.end)
      : all;

    const revenue = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
    const totalRevenue = revenue.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const totalCustomers = new Set(revenue.map((o) => o.userId)).size;
    const avgOrderValue = revenue.length > 0 ? totalRevenue / revenue.length : 0;

    return { totalRevenue, totalOrders, totalCustomers, avgOrderValue };
  }

  async getTopProducts(
    opts: { period?: string; from?: string; to?: string; limit?: number } = {},
  ): Promise<TopProduct[]> {
    const { items: all } = await this.orderRepo.findAll({ limit: 10_000 });
    const range = buildRange(opts.period, opts.from, opts.to);
    const orders = range
      ? all.filter((o) => o.createdAt >= range.start && o.createdAt <= range.end)
      : all;

    const revenue = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
    const map = new Map<string, { name: string; totalQty: number; totalRevenue: number }>();

    for (const order of revenue) {
      for (const item of order.items) {
        const e = map.get(item.productId) ?? {
          name: item.name,
          totalQty: 0,
          totalRevenue: 0,
        };
        e.totalQty += item.qty;
        e.totalRevenue += item.price * item.qty;
        map.set(item.productId, e);
      }
    }

    return [...map.entries()]
      .map(([productId, d]) => ({ productId, ...d }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, opts.limit ?? 10);
  }
}
