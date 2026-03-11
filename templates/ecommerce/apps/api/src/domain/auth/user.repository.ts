import { UserEntity } from './user.entity';
import type { UserRole } from './user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
  findAll(opts?: { role?: UserRole; cursor?: string; limit?: number }): Promise<{ items: UserEntity[]; nextCursor: string | null }>;
}
