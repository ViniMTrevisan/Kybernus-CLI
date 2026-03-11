import { ProductEntity } from './product.entity';

export interface SearchParams {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  cursor?: string;
  limit?: number;
}

export interface SearchResult {
  items: ProductEntity[];
  nextCursor: string | null;
}

export interface IProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findAll(): Promise<ProductEntity[]>;
  search(params: SearchParams): Promise<SearchResult>;
  create(product: ProductEntity): Promise<ProductEntity>;
  update(product: ProductEntity): Promise<ProductEntity>;
  softDelete(id: string): Promise<undefined>;
  updateVariantStock(productId: string, variantId: string, newStock: number): Promise<undefined>;
  slugExists(slug: string): Promise<boolean>;
}
