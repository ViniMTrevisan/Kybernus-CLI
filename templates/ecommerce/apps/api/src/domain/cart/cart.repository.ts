import { CartEntity } from './cart.entity';

export interface ICartRepository {
  findByUserId(userId: string): Promise<CartEntity | null>;
  findBySessionId(sessionId: string): Promise<CartEntity | null>;
  save(cart: CartEntity): Promise<CartEntity>;
  delete(key: { userId?: string; sessionId?: string }): Promise<void>;
}
