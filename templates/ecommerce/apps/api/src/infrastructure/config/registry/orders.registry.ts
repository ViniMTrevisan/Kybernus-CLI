import { OrderService } from '../../../application/orders/order.service';
import { orderRepository } from './checkout.registry';
import { emailService } from '../../services/email/email.registry';
import { userRepository } from './auth.registry';

export const orderService = new OrderService(orderRepository, emailService, userRepository);
