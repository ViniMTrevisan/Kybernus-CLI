import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validateUuidParam } from '../../validators/uuidParam';
import { adminController } from '../../../infrastructure/config/registry/admin.registry';

const adminRoutes = Router();

adminRoutes.use(authenticate, authorize('ADMIN'));

adminRoutes.get('/dashboard/stats', adminController.getStats);
adminRoutes.get('/dashboard/top-products', adminController.getTopProducts);
adminRoutes.get('/users', adminController.listUsers);
adminRoutes.patch('/users/:id', validateUuidParam(), adminController.updateUserRole);

// Coupon management (Phase 13)
adminRoutes.post('/coupons', adminController.createCoupon);
adminRoutes.get('/coupons', adminController.listCoupons);
adminRoutes.delete('/coupons/:id', validateUuidParam(), adminController.deleteCoupon);

export { adminRoutes };
