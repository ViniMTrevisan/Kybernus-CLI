import { randomUUID } from 'crypto';
import { AppError } from '../shared/AppError';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export interface ProductVariantProps {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  price: number | null;
  productId: string;
}

export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  categoryId: string;
  status: ProductStatus;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  variants: ProductVariantProps[];
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  categoryId: string;
  images?: string[];
  variants: Array<{
    sku: string;
    size?: string | null;
    color?: string | null;
    stock: number;
    price?: number | null;
  }>;
}

export class ProductEntity {
  private constructor(private readonly props: ProductProps) {}

  static create(input: CreateProductInput): ProductEntity {
    if (!input.name.trim()) {
      throw new AppError('Nome do produto é obrigatório', 422);
    }
    if (input.price < 0) {
      throw new AppError('Preço não pode ser negativo', 422);
    }

    const id = randomUUID();
    return new ProductEntity({
      id,
      name: input.name.trim(),
      slug: input.slug,
      description: input.description ?? null,
      price: input.price,
      categoryId: input.categoryId,
      status: ProductStatus.ACTIVE,
      images: input.images ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: input.variants.map((v) => ({
        id: randomUUID(),
        sku: v.sku,
        size: v.size ?? null,
        color: v.color ?? null,
        stock: v.stock,
        price: v.price ?? null,
        productId: id,
      })),
    });
  }

  static reconstitute(props: ProductProps): ProductEntity {
    return new ProductEntity(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get slug(): string { return this.props.slug; }
  get description(): string | null { return this.props.description; }
  get price(): number { return this.props.price; }
  get categoryId(): string { return this.props.categoryId; }
  get status(): ProductStatus { return this.props.status; }
  get images(): string[] { return this.props.images; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get variants(): ProductVariantProps[] { return this.props.variants; }

  isDeleted(): boolean {
    return this.props.status === ProductStatus.DELETED;
  }

  withUpdates(updates: Partial<Pick<ProductProps, 'name' | 'description' | 'price' | 'images' | 'status'>>): ProductEntity {
    return new ProductEntity({
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    });
  }

  withDeletedStatus(): ProductEntity {
    return this.withUpdates({ status: ProductStatus.DELETED });
  }

  withVariantStockUpdate(variantId: string, newStock: number): ProductEntity {
    return new ProductEntity({
      ...this.props,
      updatedAt: new Date(),
      variants: this.props.variants.map((v) =>
        v.id === variantId ? { ...v, stock: newStock } : v,
      ),
    });
  }

  toRecord(): ProductProps {
    return { ...this.props, variants: this.props.variants.map((v) => ({ ...v })) };
  }
}
