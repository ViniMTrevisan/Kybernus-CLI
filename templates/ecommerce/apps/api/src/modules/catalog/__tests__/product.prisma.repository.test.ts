import { PrismaClient } from '@prisma/client';
import { PrismaProductRepository } from '../product.prisma.repository';
import { PrismaCategoryRepository } from '../category.prisma.repository';
import { ProductEntity, ProductStatus } from '../product.entity';
import { CategoryEntity } from '../category.entity';

const db = new PrismaClient();
const productRepo = new PrismaProductRepository(db);
const categoryRepo = new PrismaCategoryRepository(db);

async function cleanDb() {
  await db.productVariant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
}

let testCategoryId: string;

beforeAll(async () => {
  await db.$connect();
});

afterAll(async () => {
  await cleanDb();
  await db.$disconnect();
});

beforeEach(async () => {
  await cleanDb();
  // Each test gets a fresh category to attach products to
  const cat = await categoryRepo.create(
    CategoryEntity.create({ name: 'Test Category', slug: `cat-${Date.now()}` }),
  );
  testCategoryId = cat.id;
});

let skuCounter = 0;
function makeProduct(overrides: Partial<{ name: string; slug: string }> = {}) {
  const unique = `${Date.now()}-${++skuCounter}`;
  return ProductEntity.create({
    name: overrides.name ?? 'Test Product',
    slug: overrides.slug ?? `slug-${unique}`,
    description: 'A test product',
    price: 99.99,
    categoryId: testCategoryId,
    images: ['img1.jpg'],
    variants: [
      { sku: `SKU-${unique}`, size: 'M', color: 'red', stock: 10 },
    ],
  });
}

describe('PrismaProductRepository', () => {
  it('create: deve persistir produto com variantes', async () => {
    const product = makeProduct();
    const saved = await productRepo.create(product);

    expect(saved.id).toBe(product.id);
    expect(saved.name).toBe('Test Product');
    expect(saved.price).toBe(99.99);
    expect(saved.variants).toHaveLength(1);
    expect(saved.variants[0]!.stock).toBe(10);
  });

  it('findById: deve retornar produto pelo id', async () => {
    const product = makeProduct();
    await productRepo.create(product);

    const found = await productRepo.findById(product.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(product.id);
  });

  it('findById: deve retornar null para produto deletado', async () => {
    const product = makeProduct();
    await productRepo.create(product);
    await productRepo.softDelete(product.id);

    const found = await productRepo.findById(product.id);
    expect(found).toBeNull();
  });

  it('findBySlug: deve retornar produto pelo slug', async () => {
    const product = makeProduct({ slug: 'unique-slug-test' });
    await productRepo.create(product);

    const found = await productRepo.findBySlug('unique-slug-test');
    expect(found).not.toBeNull();
    expect(found!.slug).toBe('unique-slug-test');
  });

  it('findAll: deve retornar apenas produtos ACTIVE', async () => {
    const p1 = makeProduct({ name: 'P1', slug: 'p1' });
    const p2 = makeProduct({ name: 'P2', slug: 'p2' });
    await productRepo.create(p1);
    await productRepo.create(p2);
    await productRepo.softDelete(p2.id);

    const all = await productRepo.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]!.id).toBe(p1.id);
  });

  it('search: deve filtrar por texto (q)', async () => {
    await productRepo.create(makeProduct({ name: 'Blue Sneaker', slug: 'blue-sneaker' }));
    await productRepo.create(makeProduct({ name: 'Red Hat', slug: 'red-hat' }));

    const result = await productRepo.search({ q: 'sneaker' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.name).toBe('Blue Sneaker');
  });

  it('search: deve paginar com cursor', async () => {
    for (let i = 0; i < 3; i++) {
      await productRepo.create(
        makeProduct({ name: `Product ${i}`, slug: `product-${i}-${Date.now()}-${i}` }),
      );
    }

    const page1 = await productRepo.search({ limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await productRepo.search({ cursor: page1.nextCursor!, limit: 2 });
    expect(page2.items).toHaveLength(1);
    expect(page2.nextCursor).toBeNull();
  });

  it('updateVariantStock: deve alterar o estoque do variante', async () => {
    const product = makeProduct();
    const saved = await productRepo.create(product);
    const variantId = saved.variants[0]!.id;

    await productRepo.updateVariantStock(product.id, variantId, 42);

    const updated = await productRepo.findById(product.id);
    expect(updated!.variants[0]!.stock).toBe(42);
  });

  it('softDelete: deve marcar status como DELETED sem remover do banco', async () => {
    const product = makeProduct();
    await productRepo.create(product);

    await productRepo.softDelete(product.id);

    // findById returns null for DELETED products
    const found = await productRepo.findById(product.id);
    expect(found).toBeNull();

    // But the row still exists in the database
    const raw = await db.product.findUnique({ where: { id: product.id } });
    expect(raw).not.toBeNull();
    expect(raw!.status).toBe(ProductStatus.DELETED);
  });

  it('slugExists: deve retornar true para slug existente', async () => {
    const product = makeProduct({ slug: 'existing-slug' });
    await productRepo.create(product);

    expect(await productRepo.slugExists('existing-slug')).toBe(true);
    expect(await productRepo.slugExists('nonexistent-slug')).toBe(false);
  });

  it('update: deve persistir alterações no produto', async () => {
    const product = makeProduct({ name: 'Original', slug: 'original' });
    await productRepo.create(product);

    const changed = product.withUpdates({ name: 'Updated', price: 199.99 });
    const saved = await productRepo.update(changed);

    expect(saved.name).toBe('Updated');
    expect(saved.price).toBe(199.99);
  });
});
