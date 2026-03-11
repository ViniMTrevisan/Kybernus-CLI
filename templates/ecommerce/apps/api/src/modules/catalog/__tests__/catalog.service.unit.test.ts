import { CatalogService } from '../catalog.service';
import { ICategoryRepository } from '../category.repository';
import { IProductRepository } from '../product.repository';
import { CategoryEntity } from '../category.entity';
import { ProductEntity, ProductStatus } from '../product.entity';

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeCategory = (overrides: Partial<{ id: string; name: string; slug: string }> = {}) =>
  CategoryEntity.reconstitute({
    id: overrides.id ?? 'cat-1',
    name: overrides.name ?? 'Camisetas',
    slug: overrides.slug ?? 'camisetas',
    description: null,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const makeProduct = (overrides: Partial<ReturnType<typeof ProductEntity.create>> = {}) =>
  ProductEntity.reconstitute({
    id: 'prod-1',
    name: 'Camiseta Básica',
    slug: 'camiseta-basica',
    description: 'Uma camiseta simples',
    price: 49.9,
    categoryId: 'cat-1',
    status: ProductStatus.ACTIVE,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      {
        id: 'var-1',
        sku: 'CAM-P',
        size: 'P',
        color: 'Branco',
        stock: 10,
        price: null,
        productId: 'prod-1',
      },
    ],
  });

// ── Mocks ────────────────────────────────────────────────────────────────────
const makeCategoryRepo = (): jest.Mocked<ICategoryRepository> => ({
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeProductRepo = (): jest.Mocked<IProductRepository> => ({
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  search: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  updateVariantStock: jest.fn(),
  slugExists: jest.fn(),
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe('CatalogService — Unit', () => {
  let service: CatalogService;
  let categoryRepo: jest.Mocked<ICategoryRepository>;
  let productRepo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    categoryRepo = makeCategoryRepo();
    productRepo = makeProductRepo();
    service = new CatalogService(categoryRepo, productRepo);
  });

  // ── createProduct ─────────────────────────────────────────────────────────
  describe('createProduct()', () => {
    const validInput = {
      name: 'Camiseta Básica',
      description: 'Desc',
      price: 49.9,
      categoryId: 'cat-1',
      images: [],
      variants: [{ sku: 'CAM-P', size: 'P', color: 'Branco', stock: 10 }],
    };

    it('deve criar produto com variações e estoque iniciais', async () => {
      categoryRepo.findById.mockResolvedValue(makeCategory());
      productRepo.slugExists.mockResolvedValue(false);
      productRepo.create.mockImplementation(async (p) => p);

      const result = await service.createProduct(validInput);

      expect(result.name).toBe('Camiseta Básica');
      expect(result.variants).toHaveLength(1);
      expect(result.variants[0]?.stock).toBe(10);
      expect(productRepo.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se categoria não existir', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(service.createProduct(validInput)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('deve garantir slug único a partir do nome', async () => {
      categoryRepo.findById.mockResolvedValue(makeCategory());
      // First slug attempt exists, second doesn't
      productRepo.slugExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      productRepo.create.mockImplementation(async (p) => p);

      const result = await service.createProduct(validInput);

      // Should have a slug derived from name + suffix to avoid collision
      expect(result.slug).toMatch(/^camiseta-basica/);
      expect(result.slug).not.toBe('camiseta-basica'); // original was taken
    });

    it('deve rejeitar preço negativo', async () => {
      categoryRepo.findById.mockResolvedValue(makeCategory());

      await expect(
        service.createProduct({ ...validInput, price: -1 }),
      ).rejects.toMatchObject({ statusCode: 422 });
    });
  });

  // ── updateStock ──────────────────────────────────────────────────────────
  describe('updateStock()', () => {
    it('deve decrementar estoque de uma variação', async () => {
      productRepo.findById.mockResolvedValue(makeProduct());
      productRepo.updateVariantStock.mockResolvedValue(undefined);

      await service.updateStock({ productId: 'prod-1', variantId: 'var-1', delta: -3 });

      expect(productRepo.updateVariantStock).toHaveBeenCalledWith('prod-1', 'var-1', 7);
    });

    it('deve lançar InsufficientStockError se quantidade > estoque', async () => {
      productRepo.findById.mockResolvedValue(makeProduct());

      await expect(
        service.updateStock({ productId: 'prod-1', variantId: 'var-1', delta: -999 }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('deve lançar erro 404 quando produto não existir', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateStock({ productId: 'nope', variantId: 'var-1', delta: -1 }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── searchProducts ────────────────────────────────────────────────────────
  describe('searchProducts()', () => {
    const products = [makeProduct()];

    it('deve filtrar por categoria', async () => {
      productRepo.search.mockResolvedValue({ items: products, nextCursor: null });

      const result = await service.searchProducts({ categoryId: 'cat-1' });

      expect(productRepo.search).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1' }),
      );
      expect(result.items).toHaveLength(1);
    });

    it('deve filtrar por faixa de preço', async () => {
      productRepo.search.mockResolvedValue({ items: products, nextCursor: null });

      const result = await service.searchProducts({ minPrice: 10, maxPrice: 100 });

      expect(productRepo.search).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: 10, maxPrice: 100 }),
      );
      expect(result.items).toBeDefined();
    });

    it('deve buscar por nome (full-text via q)', async () => {
      productRepo.search.mockResolvedValue({ items: products, nextCursor: null });

      await service.searchProducts({ q: 'camiseta' });

      expect(productRepo.search).toHaveBeenCalledWith(
        expect.objectContaining({ q: 'camiseta' }),
      );
    });

    it('deve paginar corretamente com cursor', async () => {
      productRepo.search.mockResolvedValue({ items: products, nextCursor: 'abc123' });

      const result = await service.searchProducts({ cursor: 'prev-cursor', limit: 10 });

      expect(result.nextCursor).toBe('abc123');
    });

    it('deve ordenar por preço asc/desc e por mais recente', async () => {
      productRepo.search.mockResolvedValue({ items: [], nextCursor: null });

      await service.searchProducts({ sortBy: 'price_asc' });
      expect(productRepo.search).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'price_asc' }),
      );

      await service.searchProducts({ sortBy: 'price_desc' });
      expect(productRepo.search).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'price_desc' }),
      );

      await service.searchProducts({ sortBy: 'newest' });
      expect(productRepo.search).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'newest' }),
      );
    });
  });
});
