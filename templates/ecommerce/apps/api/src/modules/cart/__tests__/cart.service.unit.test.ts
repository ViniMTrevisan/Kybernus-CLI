import { CartService } from '../cart.service';
import { ICartRepository } from '../cart.repository';
import { ICouponRepository } from '../coupon.repository';
import { IShippingService, ShippingOption } from '../shipping.service';
import { IProductRepository } from '../../catalog/product.repository';
import { CartEntity } from '../cart.entity';
import { CouponEntity } from '../coupon.entity';

jest.mock('../cart.repository');
jest.mock('../coupon.repository');
jest.mock('../shipping.service');
jest.mock('../../catalog/product.repository');

function makeVariant(overrides: Record<string, unknown> = {}) {
  return {
    id: 'var-1',
    sku: 'CAM-P',
    size: 'P',
    color: 'Branco',
    stock: 10,
    price: null,
    productId: 'prod-1',
    ...overrides,
  };
}

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    name: 'Camiseta Básica',
    slug: 'camiseta-basica',
    price: 99.9,
    images: [],
    variants: [makeVariant()],
    toRecord: jest.fn().mockReturnThis(),
    ...overrides,
  };
}

describe('CartService — Unit', () => {
  let cartRepo: jest.Mocked<ICartRepository>;
  let couponRepo: jest.Mocked<ICouponRepository>;
  let shippingService: jest.Mocked<IShippingService>;
  let productRepo: jest.Mocked<IProductRepository>;
  let service: CartService;

  beforeEach(() => {
    cartRepo = {
      findByUserId: jest.fn(),
      findBySessionId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ICartRepository>;

    couponRepo = {
      findByCode: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      incrementUsage: jest.fn(),
    } as jest.Mocked<ICouponRepository>;

    shippingService = {
      calculate: jest.fn(),
    } as jest.Mocked<IShippingService>;

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

    service = new CartService(cartRepo, couponRepo, shippingService, productRepo);
  });

  it('deve criar carrinho vazio para novo usuário', async () => {
    cartRepo.findByUserId.mockResolvedValue(null);
    cartRepo.save.mockImplementation(async (cart) => cart);

    const cart = await service.getCart({ userId: 'user-1' });

    expect(cart.items).toHaveLength(0);
    expect(cart.userId).toBe('user-1');
  });

  it('deve persistir carrinho no "Redis" com TTL via save', async () => {
    cartRepo.findByUserId.mockResolvedValue(null);
    const savedCart = CartEntity.create('user-1');
    cartRepo.save.mockResolvedValue(savedCart);

    const item = { variantId: 'var-1', productId: 'prod-1', qty: 1 };
    const product = makeProduct();
    productRepo.findById.mockResolvedValue(product as never);
    cartRepo.findByUserId.mockResolvedValueOnce(CartEntity.create('user-1'));
    cartRepo.save.mockImplementation(async (c) => c);

    await service.addItem({ userId: 'user-1' }, item);

    expect(cartRepo.save).toHaveBeenCalled();
  });

  it('deve mesclar carrinho anônimo com carrinho do usuário ao login', async () => {
    const anonCart = CartEntity.create(null, 'session-abc')
      .addItem({ variantId: 'var-1', productId: 'prod-1', name: 'Camiseta', sku: 'CAM-P', price: 99.9, qty: 2, image: null });

    const userCart = CartEntity.create('user-1')
      .addItem({ variantId: 'var-2', productId: 'prod-2', name: 'Calça', sku: 'CAL-M', price: 150, qty: 1, image: null });

    cartRepo.findBySessionId.mockResolvedValue(anonCart);
    cartRepo.findByUserId.mockResolvedValue(userCart);
    cartRepo.save.mockImplementation(async (c) => c);
    cartRepo.delete.mockResolvedValue();

    const merged = await service.mergeAnonymousCart('user-1', 'session-abc');

    expect(merged.items).toHaveLength(2);
    expect(cartRepo.delete).toHaveBeenCalledWith({ sessionId: 'session-abc' });
  });

  it('deve validar estoque disponível ao adicionar item', async () => {
    const product = makeProduct({ variants: [makeVariant({ stock: 0 })] });
    productRepo.findById.mockResolvedValue(product as never);
    cartRepo.findByUserId.mockResolvedValue(CartEntity.create('user-1'));

    await expect(
      service.addItem({ userId: 'user-1' }, { variantId: 'var-1', productId: 'prod-1', qty: 1 }),
    ).rejects.toThrow('Estoque insuficiente');
  });

  it('deve calcular opções de frete via shippingService', async () => {
    const options: ShippingOption[] = [
      { name: 'PAC', price: 18.5, estimatedDays: 7 },
      { name: 'SEDEX', price: 32, estimatedDays: 2 },
    ];
    shippingService.calculate.mockResolvedValue(options);
    cartRepo.findByUserId.mockResolvedValue(CartEntity.create('user-1'));

    const result = await service.getShippingOptions({ userId: 'user-1' }, '01310-100');

    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe('PAC');
    expect(shippingService.calculate).toHaveBeenCalledWith('01310-100', expect.any(Array));
  });
});
