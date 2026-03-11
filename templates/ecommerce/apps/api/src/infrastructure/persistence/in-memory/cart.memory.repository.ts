import { CartEntity } from '../../../domain/cart/cart.entity';
import type { ICartRepository } from '../../../domain/cart/cart.repository';

// Simulates Redis TTL-based storage using two Maps (by userId and by sessionId).
export class InMemoryCartRepository implements ICartRepository {
  private byUser = new Map<string, CartEntity>();
  private bySession = new Map<string, CartEntity>();

  async findByUserId(userId: string): Promise<CartEntity | null> {
    return this.byUser.get(userId) ?? null;
  }

  async findBySessionId(sessionId: string): Promise<CartEntity | null> {
    return this.bySession.get(sessionId) ?? null;
  }

  async save(cart: CartEntity): Promise<CartEntity> {
    if (cart.userId) this.byUser.set(cart.userId, cart);
    if (cart.sessionId) this.bySession.set(cart.sessionId, cart);
    return cart;
  }

  async delete(key: { userId?: string; sessionId?: string }): Promise<void> {
    if (key.userId) this.byUser.delete(key.userId);
    if (key.sessionId) this.bySession.delete(key.sessionId);
  }

  /** Test helper — wipe all entries */
  clear(): void {
    this.byUser.clear();
    this.bySession.clear();
  }
}
