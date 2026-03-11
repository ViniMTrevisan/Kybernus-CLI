/**
 * CheckoutService — Unit Tests
 * StripeAdapter and repositories are mocked.
 */

import { CheckoutService } from '../checkout.service';
import { IOrderRepository } from '../order.repository';
import { IPaymentAdapter, PaymentError } from '../../payment/payment.port';
import { ICartRepository } from '../../cart/cart.repository';
import { IProductRepository } from '../../catalog/product.repository';
import { CartEntity } from '../../cart/cart.entity';
import { OrderEntity } from '../order.entity';

function makeCartWithItems(userId = 'user-1') {
  return CartEntity.create(userId)
    .addItem({
      variantId: 'var-1',
      productId: 'prod-1',
      name: 'Camiseta',
      sku: 'CAM-P',
      price: 99.9,
      qty: 2,
      image: null,
    });
}

function makeProduct(stock = 10) {
  return {
    id: 'prod-1',
    name: 'Camiseta',
    slug: 'camiseta',
    price: 99.9,
    images: [],
    variants: [{ id: 'var-1', sku: 'CAM-P', size: 'P', color: 'Branco', stock, price: null, productId: 'prod-1' }],
    toRecord: jest.fn().mockReturnThis(),
  };
}

describe('CheckoutService — Unit', () => {
  let orderRepo: jest.Mocked<IOrderRepository>;
  let paymentAdapter: jest.Mocked<IPaymentAdapter>;
  let cartRepo: jest.Mocked<ICartRepository>;
  let productRepo: jest.Mocked<IProductRepository>;
  let service: CheckoutService;

  beforeEach(() => {
    orderRepo = {
      findById: jest.fn(),
      findByPaymentIntentId: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as jest.Mocked<IOrderRepository>;

    paymentAdapter = {
      createPaymentIntent: jest.fn(),
    } as jest.Mocked<IPaymentAdapter>;

    cartRepo = {
      findByUserId: jest.fn(),
      findBySessionId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ICartRepository>;

    productRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      updateVariantStock: jest.fn(),
      slugExists: jest.fn(),
    } as jest.Mocked<IProductRepository>;

    service = new CheckoutService(orderRepo, paymentAdapter, cartRepo, productRepo);
  });

  it('deve criar Order a partir de um Cart válido', async () => {
    const cart = makeCartWithItems();
    cartRepo.findByUserId.mockResolvedValue(cart);
    productRepo.findById.mockResolvedValue(makeProduct() as never);
    paymentAdapter.createPaymentIntent.mockResolvedValue({ id: 'pi_1', clientSecret: 'secret_1' });
    orderRepo.create.mockImplementation(async (o) => o);
    cartRepo.delete.mockResolvedValue();

    const result = await service.checkout({ userId: 'user-1', shippingCost: 18.5, shippingAddress: null });

    expect(result.orderId).toBeDefined();
    expect(result.clientSecret).toBe('secret_1');
    expect(orderRepo.create).toHaveBeenCalled();
  });

  it('deve chamar stripeAdapter.createPaymentIntent com valor correto', async () => {
    const cart = makeCartWithItems(); // 2 × 99.9 = 199.8 + 18.5 shipping = 218.3
    cartRepo.findByUserId.mockResolvedValue(cart);
    productRepo.findById.mockResolvedValue(makeProduct() as never);
    paymentAdapter.createPaymentIntent.mockResolvedValue({ id: 'pi_2', clientSecret: 'secret_2' });
    orderRepo.create.mockImplementation(async (o) => o);
    cartRepo.delete.mockResolvedValue();

    await service.checkout({ userId: 'user-1', shippingCost: 18.5, shippingAddress: null });

    expect(paymentAdapter.createPaymentIntent).toHaveBeenCalledWith(
      expect.closeTo(218.3, 1),
      'brl',
      expect.any(Object),
    );
  });

  it('deve decrementar estoque dos produtos ao confirmar pedido', async () => {
    const cart = makeCartWithItems(); // qty=2
    cartRepo.findByUserId.mockResolvedValue(cart);
    productRepo.findById.mockResolvedValue(makeProduct() as never);
    paymentAdapter.createPaymentIntent.mockResolvedValue({ id: 'pi_3', clientSecret: 'secret_3' });
    orderRepo.create.mockImplementation(async (o) => o);
    cartRepo.delete.mockResolvedValue();

    await service.checkout({ userId: 'user-1', shippingCost: 0, shippingAddress: null });

    expect(productRepo.updateVariantStock).toHaveBeenCalledWith('prod-1', 'var-1', expect.any(Number));
  });

  it('deve limpar o carrinho após criação do pedido bem-sucedida', async () => {
    const cart = makeCartWithItems();
    cartRepo.findByUserId.mockResolvedValue(cart);
    productRepo.findById.mockResolvedValue(makeProduct() as never);
    paymentAdapter.createPaymentIntent.mockResolvedValue({ id: 'pi_4', clientSecret: 's4' });
    orderRepo.create.mockImplementation(async (o) => o);
    cartRepo.delete.mockResolvedValue();

    await service.checkout({ userId: 'user-1', shippingCost: 0, shippingAddress: null });

    expect(cartRepo.delete).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('deve fazer rollback de estoque se stripe.createPaymentIntent lançar erro', async () => {
    const cart = makeCartWithItems();
    cartRepo.findByUserId.mockResolvedValue(cart);
    productRepo.findById.mockResolvedValue(makeProduct() as never);
    orderRepo.create.mockImplementation(async (o) => o);
    // Simulate Stripe error after stock has been decremented
    productRepo.updateVariantStock.mockResolvedValue(undefined as never);
    paymentAdapter.createPaymentIntent.mockRejectedValue(new PaymentError('card_declined', 'Cartão recusado'));

    await expect(
      service.checkout({ userId: 'user-1', shippingCost: 0, shippingAddress: null }),
    ).rejects.toThrow(PaymentError);

    // Stock rollback: updateVariantStock called twice (decrement + restore)
    expect(productRepo.updateVariantStock).toHaveBeenCalledTimes(2);
  });

  it('deve incluir frete selecionado no total enviado ao Stripe', async () => {
    const cart = makeCartWithItems(); // subtotal = 199.8
    cartRepo.findByUserId.mockResolvedValue(cart);
    productRepo.findById.mockResolvedValue(makeProduct() as never);
    paymentAdapter.createPaymentIntent.mockResolvedValue({ id: 'pi_5', clientSecret: 's5' });
    orderRepo.create.mockImplementation(async (o) => o);
    cartRepo.delete.mockResolvedValue();

    await service.checkout({ userId: 'user-1', shippingCost: 32, shippingAddress: null });

    expect(paymentAdapter.createPaymentIntent).toHaveBeenCalledWith(
      expect.closeTo(231.8, 1),
      'brl',
      expect.any(Object),
    );
  });

  it('deve lançar erro se algum item tiver estoque insuficiente no checkout', async () => {
    const cart = makeCartWithItems(); // qty=2
    cartRepo.findByUserId.mockResolvedValue(cart);
    productRepo.findById.mockResolvedValue(makeProduct(1) as never); // only 1 in stock

    await expect(
      service.checkout({ userId: 'user-1', shippingCost: 0, shippingAddress: null }),
    ).rejects.toThrow('Estoque insuficiente');
  });

  it('deve lançar erro se o carrinho estiver vazio', async () => {
    cartRepo.findByUserId.mockResolvedValue(CartEntity.create('user-1'));

    await expect(
      service.checkout({ userId: 'user-1', shippingCost: 0, shippingAddress: null }),
    ).rejects.toThrow('vazio');
  });
});
