import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import * as cartController from './cart.controller';

const router = Router();

// All cart routes require authentication (users must be logged in)
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:variantId', cartController.updateItem);
router.delete('/items/:variantId', cartController.removeItem);
router.post('/coupon', cartController.applyCoupon);
router.get('/shipping', cartController.getShipping);

export default router;
