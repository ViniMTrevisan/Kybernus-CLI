import { randomUUID } from 'crypto';
import { ICategoryRepository } from '../../domain/catalog/category.repository';
import { IProductRepository, SearchParams, SearchResult } from '../../domain/catalog/product.repository';
import { ProductEntity } from '../../domain/catalog/product.entity';
import { AppError } from '../../domain/shared/AppError';
import { IStorageService } from '../ports/storage.port';

// ── Helpers ───────────────────────────────────────────────────────────────────
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface CreateProductDto {
  name: string;
  description?: string | null;
  price: number;
  categoryId?: string;
  categorySlug?: string;
  images?: string[];
  variants: Array<{
    sku: string;
    size?: string | null;
    color?: string | null;
    stock: number;
    price?: number | null;
  }>;
}

export interface UpdateProductDto {
  name?: string;
  description?: string | null;
  price?: number;
  images?: string[];
}

export interface UpdateStockDto {
  productId: string;
  variantId: string;
  delta: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
export class CatalogService {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly productRepository: IProductRepository,
    private readonly storageService?: IStorageService,
  ) {}

  // ── createProduct ─────────────────────────────────────────────────────────
  async createProduct(dto: CreateProductDto): Promise<ProductEntity> {
    // Validate price eagerly before category lookup
    if (dto.price < 0) {
      throw new AppError('Preço não pode ser negativo', 422);
    }

    // Resolve category (accepts either categoryId or categorySlug)
    let categoryId = dto.categoryId;
    if (!categoryId && dto.categorySlug) {
      const category = await this.categoryRepository.findBySlug(dto.categorySlug);
      if (!category) throw new AppError(`Categoria '${dto.categorySlug}' não encontrada`, 404);
      categoryId = category.id;
    } else if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) throw new AppError('Categoria não encontrada', 404);
    } else {
      throw new AppError('Categoria é obrigatória', 422);
    }

    // Generate unique slug
    const baseSlug = toSlug(dto.name);
    let slug = baseSlug;
    let attempt = 0;
    while (await this.productRepository.slugExists(slug)) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const product = ProductEntity.create({
      name: dto.name,
      slug,
      description: dto.description,
      price: dto.price,
      categoryId,
      images: dto.images,
      variants: dto.variants,
    });

    return this.productRepository.create(product);
  }

  // ── updateProduct ─────────────────────────────────────────────────────────
  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404);

    if (dto.price !== undefined && dto.price < 0) {
      throw new AppError('Preço não pode ser negativo', 422);
    }

    const updated = product.withUpdates(dto);
    return this.productRepository.update(updated);
  }

  // ── deleteProduct ─────────────────────────────────────────────────────────
  async deleteProduct(id: string): Promise<undefined> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError('Produto não encontrado', 404);
    return this.productRepository.softDelete(id);
  }

  // ── getProductBySlug ──────────────────────────────────────────────────────
  async getProductBySlug(slug: string): Promise<ProductEntity> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) throw new AppError('Produto não encontrado', 404);
    return product;
  }

  // ── updateStock ───────────────────────────────────────────────────────────
  async updateStock(dto: UpdateStockDto): Promise<{ variantId: string; stock: number }> {
    const product = await this.productRepository.findById(dto.productId);
    if (!product) throw new AppError('Produto não encontrado', 404);

    const variant = product.variants.find((v) => v.id === dto.variantId);
    if (!variant) throw new AppError('Variação não encontrada', 404);

    const newStock = variant.stock + dto.delta;
    if (newStock < 0) {
      throw new AppError('Estoque insuficiente', 409);
    }

    await this.productRepository.updateVariantStock(dto.productId, dto.variantId, newStock);
    return { variantId: dto.variantId, stock: newStock };
  }

  // ── searchProducts ────────────────────────────────────────────────────────
  async searchProducts(params: SearchParams): Promise<SearchResult> {
    return this.productRepository.search(params);
  }

  // ── Category helpers ──────────────────────────────────────────────────────
  async listCategories() {
    return this.categoryRepository.findAll();
  }

  // ── uploadProductImage ────────────────────────────────────────────────────
  async uploadProductImage(productId: string, buffer: Buffer, mimetype: string): Promise<ProductEntity> {
    if (!this.storageService) {
      throw new AppError('Storage service not configured', 500);
    }
    const product = await this.productRepository.findById(productId);
    if (!product) throw new AppError('Produto não encontrado', 404);

    const ext = mimetype.split('/')[1] ?? 'jpg';
    const key = `products/${productId}/${randomUUID()}.${ext}`;
    const url = await this.storageService.upload(key, buffer, mimetype);

    const updated = product.withUpdates({ images: [...product.images, url] });
    return this.productRepository.update(updated);
  }
}
