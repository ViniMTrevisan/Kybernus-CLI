import { DashboardService } from '../../../application/admin/dashboard.service';
import { AdminUserService } from '../../../application/admin/admin-user.service';
import { AdminController } from '../../../presentation/modules/admin/admin.controller';
import { orderRepository } from './checkout.registry';
import { userRepository } from './auth.registry';
import { couponRepository } from './cart.registry';
import { CouponAdminService } from '../../../application/cart/coupon.service';

const dashboardService = new DashboardService(orderRepository);
const adminUserService = new AdminUserService(userRepository);
const couponAdminService = new CouponAdminService(couponRepository);

export const adminController = new AdminController(dashboardService, adminUserService, couponAdminService);
