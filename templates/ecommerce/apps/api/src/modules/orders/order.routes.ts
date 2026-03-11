import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { validateUuidParam } from '../../shared/validators/uuidParam';
import * as orderController from './order.controller';

// ── Customer routes — mounted at /api/orders ─────────────────────────────────
export const orderRoutes = Router();
orderRoutes.use(authenticate);
orderRoutes.get('/', orderController.listOrders);
orderRoutes.get('/:id', validateUuidParam(), orderController.getOrder);

// ── Admin routes — mounted at /api/admin/orders ──────────────────────────────
export const adminOrderRoutes = Router();
adminOrderRoutes.use(authenticate, authorize('ADMIN'));
adminOrderRoutes.get('/', orderController.adminListOrders);
adminOrderRoutes.patch('/:id/status', validateUuidParam(), orderController.adminUpdateOrderStatus);
