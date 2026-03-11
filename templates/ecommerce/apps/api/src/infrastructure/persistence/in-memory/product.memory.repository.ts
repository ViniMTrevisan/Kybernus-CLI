import { ProductEntity, ProductProps, ProductStatus } from '../../../domain/catalog/product.entity';
import type { IProductRepository, SearchParams, SearchResult } from '../../../domain/catalog/product.repository';

export class InMemoryProductRepository implements IProductRepository {
  private store = new Map<string, ProductProps>();

  async findById(id: string): Promise<ProductEntity | null> {
    const props = this.store.get(id);
    if (!props || props.status === ProductStatus.DELETED) return null;
    return ProductEntity.reconstitute(props);
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    for (const props of this.store.values()) {
      if (props.slug === slug && props.status !== ProductStatus.DELETED) {
        return ProductEntity.reconstitute(props);
      }
    }
    return null;
  }

  async findAll(): Promise<ProductEntity[]> {
    return Array.from(this.store.values())
      .filter((p) => p.status === ProductStatus.ACTIVE)
      .map(ProductEntity.reconstitute);
  }

  async search(params: SearchParams): Promise<SearchResult> {
    const { q, categoryId, minPrice, maxPrice, sortBy, cursor, limit = 20 } = params;
    let items = Array.from(this.store.values()).filter(
      (p) => p.status === ProductStatus.ACTIVE,
    );

    if (categoryId) items = items.filter((p) => p.categoryId === categoryId);
    if (minPrice !== undefined) items = items.filter((p) => p.price >= minPrice);
    if (maxPrice !== undefined) items = items.filter((p) => p.price <= maxPrice);
    if (q) {
      const lower = q.toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(lower));
    }

    // Sorting
    if (sortBy === 'price_asc') items.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') items.sort((a, b) => b.price - a.price);
    else items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Cursor-based pagination
    let start = 0;
    if (cursor) {
      const idx = items.findIndex((p) => p.id === cursor);
      if (idx !== -1) start = idx + 1;
    }

    const page = items.slice(start, start + limit);
    const nextItem = items[start + limit];
    const nextCursor = nextItem ? nextItem.id : null;

    return { items: page.map(ProductEntity.reconstitute), nextCursor };
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    this.store.set(product.id, product.toRecord());
    return product;
  }

  async update(product: ProductEntity): Promise<ProductEntity> {
    this.store.set(product.id, product.toRecord());
    return product;
  }

  async softDelete(id: string): Promise<undefined> {
    const props = this.store.get(id);
    if (props) {
      this.store.set(id, { ...props, status: ProductStatus.DELETED, updatedAt: new Date() });
    }
    return undefined;
  }

  async updateVariantStock(productId: string, variantId: string, newStock: number): Promise<undefined> {
    const props = this.store.get(productId);
    if (props) {
      const updatedVariants = props.variants.map((v) =>
        v.id === variantId ? { ...v, stock: newStock } : v,
      );
      this.store.set(productId, { ...props, variants: updatedVariants });
    }
    return undefined;
  }

  async slugExists(slug: string): Promise<boolean> {
    for (const props of this.store.values()) {
      if (props.slug === slug) return true;
    }
    return false;
  }

  clear(): void {
    this.store.clear();
  }
}
