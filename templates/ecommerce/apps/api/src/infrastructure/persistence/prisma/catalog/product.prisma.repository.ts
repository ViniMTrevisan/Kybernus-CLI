import type { PrismaClient, Product, ProductVariant } from '@prisma/client';
import { ProductEntity, ProductStatus } from '../../../../domain/catalog/product.entity';
import type { IProductRepository, SearchParams, SearchResult } from '../../../../domain/catalog/product.repository';

type ProductWithVariants = Product & { variants: ProductVariant[] };

function toEntity(row: ProductWithVariants): ProductEntity {
  return ProductEntity.reconstitute({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    categoryId: row.categoryId,
    status: row.status as ProductStatus,
    images: row.images,
    variants: row.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
      price: v.price !== null ? Number(v.price) : null,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

const INCLUDE_VARIANTS = { variants: true } as const;

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<ProductEntity | null> {
    const row = await this.db.product.findFirst({
      where: { id, status: { not: 'DELETED' } },
      include: INCLUDE_VARIANTS,
    });
    return row ? toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    const row = await this.db.product.findFirst({
      where: { slug, status: { not: 'DELETED' } },
      include: INCLUDE_VARIANTS,
    });
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<ProductEntity[]> {
    const rows = await this.db.product.findMany({
      where: { status: 'ACTIVE' },
      include: INCLUDE_VARIANTS,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toEntity);
  }

  async search(params: SearchParams): Promise<SearchResult> {
    const { q, categoryId, minPrice, maxPrice, sortBy, cursor, limit = 20 } = params;

    const rows = await this.db.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(categoryId ? { categoryId } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
              },
            }
          : {}),
      },
      orderBy:
        sortBy === 'price_asc'
          ? { price: 'asc' }
          : sortBy === 'price_desc'
            ? { price: 'desc' }
            : { createdAt: 'desc' },
      include: INCLUDE_VARIANTS,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]!.id : null;

    return { items: items.map(toEntity), nextCursor };
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    const row = await this.db.product.create({
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        status: product.status,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        variants: {
          createMany: {
            data: product.variants.map((v) => ({
              id: v.id,
              sku: v.sku,
              size: v.size,
              color: v.color,
              stock: v.stock,
              price: v.price ?? null,
            })),
          },
        },
      },
      include: INCLUDE_VARIANTS,
    });
    return toEntity(row);
  }

  async update(product: ProductEntity): Promise<ProductEntity> {
    const row = await this.db.$transaction(async (tx) => {
      // Replace all variants atomically
      await tx.productVariant.deleteMany({ where: { productId: product.id } });

      return tx.product.update({
        where: { id: product.id },
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          status: product.status,
          images: product.images,
          variants: {
            createMany: {
              data: product.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                size: v.size,
                color: v.color,
                stock: v.stock,
                price: v.price ?? null,
              })),
            },
          },
        },
        include: INCLUDE_VARIANTS,
      });
    });
    return toEntity(row);
  }

  async softDelete(id: string): Promise<undefined> {
    await this.db.product.update({
      where: { id },
      data: { status: 'DELETED' },
    });
    return undefined;
  }

  async updateVariantStock(
    productId: string,
    variantId: string,
    newStock: number,
  ): Promise<undefined> {
    await this.db.productVariant.updateMany({
      where: { id: variantId, productId },
      data: { stock: newStock },
    });
    return undefined;
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.db.product.count({ where: { slug } });
    return count > 0;
  }
}
