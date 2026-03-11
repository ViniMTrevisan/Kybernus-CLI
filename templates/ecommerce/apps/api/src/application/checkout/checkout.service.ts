import { AppError } from '../../domain/shared/AppError';
import { OrderEntity } from '../../domain/checkout/order.entity';
import { IOrderRepository } from '../../domain/checkout/order.repository';
import { IPaymentAdapter } from '../ports/payment.port';
import { ICartRepository } from '../../domain/cart/cart.repository';
import { IProductRepository } from '../../domain/catalog/product.repository';

interface CheckoutDto {
  userId: string;
  shippingCost: number;
  shippingAddress: Record<string, string> | null;
}

export class CheckoutService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly paymentAdapter: IPaymentAdapter,
    private readonly cartRepo: ICartRepository,
    private readonly productRepo: IProductRepository,
  ) {}

  async checkout(dto: CheckoutDto): Promise<{ orderId: string; clientSecret: string }> {
    const { userId, shippingCost, shippingAddress } = dto;

    // 1. Get cart — throw if empty
    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Carrinho vazio', 400);
    }

    // 2. Validate stock for every item and snapshot current levels
    const stockSnapshot: Array<{
      productId: string;
      variantId: string;
      currentStock: number;
      newStock: number;
    }> = [];

    for (const item of cart.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) throw new AppError('Produto não encontrado', 404);
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) throw new AppError('Variante não encontrada', 404);
      if (variant.stock < item.qty) {
        throw new AppError('Estoque insuficiente', 409);
      }
      stockSnapshot.push({
        productId: item.productId,
        variantId: item.variantId,
        currentStock: variant.stock,
        newStock: variant.stock - item.qty,
      });
    }

    // 3. Compute totals
    const subtotal = cart.subtotal;
    const discount = cart.discount;
    const tax = 0; // TaxService placeholder — returns 0
    const total = subtotal - discount + shippingCost + tax;

    // 4. Create Order (PENDING)
    const orderItems = cart.items.map((item) => ({
      id: crypto.randomUUID(),
      variantId: item.variantId,
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      price: item.price,
      qty: item.qty,
      image: item.image,
    }));

    const order = OrderEntity.create({
      userId,
      items: orderItems,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      couponCode: cart.coupon?.code ?? null,
      paymentIntentId: null,
      shippingAddress,
    });
    await this.orderRepo.create(order);

    // 5. Decrement stock
    for (const snap of stockSnapshot) {
      await this.productRepo.updateVariantStock(snap.productId, snap.variantId, snap.newStock);
    }

    // 6. Create PaymentIntent — rollback on failure
    try {
      const pi = await this.paymentAdapter.createPaymentIntent(total, 'brl', { orderId: order.id });

      // Attach paymentIntentId to order
      const updatedOrder = order.withPaymentIntentId(pi.id);
      await this.orderRepo.update(updatedOrder);

      // 7. Clear cart
      await this.cartRepo.delete({ userId });

      return { orderId: order.id, clientSecret: pi.clientSecret };
    } catch (err) {
      // Rollback stock to previous levels
      for (const snap of stockSnapshot) {
        await this.productRepo.updateVariantStock(snap.productId, snap.variantId, snap.currentStock);
      }
      // Mark order as failed
      await this.orderRepo.update(order.fail());
      throw err;
    }
  }
}
