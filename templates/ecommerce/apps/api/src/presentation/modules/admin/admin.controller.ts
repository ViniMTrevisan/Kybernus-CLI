import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { DashboardService } from '../../../application/admin/dashboard.service';
import type { AdminUserService } from '../../../application/admin/admin-user.service';
import { createCouponSchema, CouponAdminService } from '../../../application/cart/coupon.service';

// ── Zod schemas ───────────────────────────────────────────────────────────────
const periodSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'custom']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const userListSchema = z.object({
  role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'CUSTOMER']),
});

// ── AdminController ───────────────────────────────────────────────────────────
export class AdminController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly adminUserService: AdminUserService,
    private readonly couponAdminService: CouponAdminService,
  ) {}

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = periodSchema.parse(req.query);
      const stats = await this.dashboardService.getStats(query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };

  getTopProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = periodSchema.parse(req.query);
      const products = await this.dashboardService.getTopProducts(query);
      res.json({ items: products });
    } catch (err) {
      next(err);
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = userListSchema.parse(req.query);
      const result = await this.adminUserService.listUsers(query);
      res.json({
        items: result.items.map((u) => u.toPublic()),
        nextCursor: result.nextCursor,
      });
    } catch (err) {
      next(err);
    }
  };

  updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = updateRoleSchema.parse(req.body);
      const requesterId = (req.user as { id: string }).id;
      await this.adminUserService.updateUserRole(id, role, requesterId);
      res.json({ message: 'Role atualizado com sucesso' });
    } catch (err) {
      next(err);
    }
  };

  // ── Coupon handlers ───────────────────────────────────────────────────────

  createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = createCouponSchema.parse(req.body);
      const coupon = await this.couponAdminService.create(dto);
      res.status(201).json(coupon.toRecord());
    } catch (err) {
      next(err);
    }
  };

  listCoupons = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupons = await this.couponAdminService.list();
      res.json({ items: coupons.map((c) => c.toRecord()) });
    } catch (err) {
      next(err);
    }
  };

  deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.couponAdminService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
