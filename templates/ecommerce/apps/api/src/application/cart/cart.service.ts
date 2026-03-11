import { AppError } from '../../domain/shared/AppError';
import { CartEntity, CartItemProps } from '../../domain/cart/cart.entity';
import { ICartRepository } from '../../domain/cart/cart.repository';
import { ICouponRepository } from '../../domain/cart/coupon.repository';
import { IShippingService, ShippingOption } from '../ports/shipping.port';
import { IProductRepository } from '../../domain/catalog/product.repository';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CartKey {
  userId?: string;
  sessionId?: string;
}

export interface AddItemDto {
  productId: string;
  variantId: string;
  qty: number;
}

// ── CartService ───────────────────────────────────────────────────────────────
export class CartService {
  constructor(
    private readonly cartRepo: ICartRepository,
    private readonly couponRepo: ICouponRepository,
    private readonly shippingService: IShippingService,
    private readonly productRepo: IProductRepository,
  ) {}

  // ── getCart ───────────────────────────────────────────────────────────────
  async getCart(key: CartKey): Promise<CartEntity> {
    const existing = await this._find(key);
    if (existing) return existing;
    return CartEntity.create(key.userId ?? null, key.sessionId ?? null);
  }

  private async _find(key: CartKey): Promise<CartEntity | null> {
    if (key.userId) return this.cartRepo.findByUserId(key.userId);
    if (key.sessionId) return this.cartRepo.findBySessionId(key.sessionId);
    return null;
  }

  private async _findProductByVariantId(variantId: string) {
    const all = await this.productRepo.findAll();
    return all.find((p) => p.variants.some((v) => v.id === variantId)) ?? null;
  }

  // ── addItem ───────────────────────────────────────────────────────────────
  async addItem(key: CartKey, dto: AddItemDto): Promise<CartEntity> {
    if (dto.qty <= 0) throw new AppError('Quantidade deve ser maior que zero', 400);

    const product = await this.productRepo.findById(dto.productId);
    if (!product) throw new AppError('Produto não encontrado', 404);

    const variant = product.variants.find((v) => v.id === dto.variantId);
    if (!variant) throw new AppError('Variante não encontrada', 404);

    // Stock check: existing cart qty + new qty must not exceed stock
    let cart = await this.getCart(key);
    const existingItem = cart.items.find((i) => i.variantId === dto.variantId);
    const currentQty = existingItem?.qty ?? 0;
    if (currentQty + dto.qty > variant.stock) {
      throw new AppError('Estoque insuficiente', 409);
    }

    const price = variant.price !== null && variant.price !== undefined
      ? Number(variant.price)
      : Number(product.price);

    const item: CartItemProps = {
      variantId: dto.variantId,
      productId: dto.productId,
      name: product.name,
      sku: variant.sku,
      price,
      qty: dto.qty,
      image: product.images[0] ?? null,
    };

    cart = cart.addItem(item);
    return this.cartRepo.save(cart);
  }

  // ── updateItem ────────────────────────────────────────────────────────────
  async updateItem(key: CartKey, variantId: string, qty: number): Promise<CartEntity> {
    if (qty < 0) throw new AppError('Quantidade não pode ser negativa', 400);

    let cart = await this.getCart(key);

    if (qty > 0) {
      const product = await this._findProductByVariantId(variantId);
      const variant = product?.variants.find((v) => v.id === variantId);
      if (variant && qty > variant.stock) {
        throw new AppError('Estoque insuficiente', 409);
      }
    }

    cart = cart.updateItem(variantId, qty);
    return this.cartRepo.save(cart);
  }

  // ── removeItem ────────────────────────────────────────────────────────────
  async removeItem(key: CartKey, variantId: string): Promise<CartEntity> {
    const cart = (await this.getCart(key)).removeItem(variantId);
    return this.cartRepo.save(cart);
  }

  // ── applyCoupon ───────────────────────────────────────────────────────────
  async applyCoupon(key: CartKey, code: string): Promise<CartEntity> {
    const coupon = await this.couponRepo.findByCode(code);
    if (!coupon) throw new AppError('Cupom não encontrado', 404);

    let cart = await this.getCart(key);
    cart = cart.applyCoupon(coupon); // throws 400 if expired / minimum not met
    return this.cartRepo.save(cart);
  }

  // ── getShippingOptions ────────────────────────────────────────────────────
  async getShippingOptions(key: CartKey, cep: string): Promise<ShippingOption[]> {
    const cart = await this.getCart(key);
    const items = cart.items.map((i) => ({ qty: i.qty }));
    return this.shippingService.calculate(cep, items);
  }

  // ── mergeAnonymousCart ────────────────────────────────────────────────────
  async mergeAnonymousCart(userId: string, sessionId: string): Promise<CartEntity> {
    const [anonCart, userCart] = await Promise.all([
      this.cartRepo.findBySessionId(sessionId),
      this.cartRepo.findByUserId(userId),
    ]);

    if (!anonCart) {
      return userCart ?? CartEntity.create(userId);
    }

    let merged = userCart ?? CartEntity.create(userId);
    for (const item of anonCart.items) {
      merged = merged.addItem({ ...item });
    }

    if (anonCart.coupon) {
      try {
        merged = merged.applyCoupon(anonCart.coupon);
      } catch {
        // Ignore coupon errors during merge
      }
    }

    await this.cartRepo.delete({ sessionId });
    return this.cartRepo.save(merged);
  }
}
