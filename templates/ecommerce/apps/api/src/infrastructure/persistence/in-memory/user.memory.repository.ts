import { UserEntity } from '../../../domain/auth/user.entity';
import type { UserRole } from '../../../domain/auth/user.entity';
import type { IUserRepository } from '../../../domain/auth/user.repository';

export class InMemoryUserRepository implements IUserRepository {
  private readonly store = new Map<string, ReturnType<UserEntity['toRecord']>>();

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = [...this.store.values()].find(
      (u) => u.email === email.toLowerCase(),
    );
    return record ? UserEntity.reconstitute(record) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = this.store.get(id);
    return record ? UserEntity.reconstitute(record) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    this.store.set(user.id, user.toRecord());
    return user;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    this.store.set(user.id, user.toRecord());
    return user;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async findAll(
    opts: { role?: UserRole; cursor?: string; limit?: number } = {},
  ): Promise<{ items: UserEntity[]; nextCursor: string | null }> {
    const { role, cursor, limit = 20 } = opts;
    let all = [...this.store.values()].map((u) => UserEntity.reconstitute(u));
    if (role) all = all.filter((u) => u.role === role);
    all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const startIdx = cursor ? all.findIndex((u) => u.id === cursor) + 1 : 0;
    const page = all.slice(startIdx, startIdx + limit);
    const nextCursor =
      page.length === limit && startIdx + limit < all.length
        ? (page[page.length - 1]!.id)
        : null;
    return { items: page, nextCursor };
  }

  /** Test helper — reset state between test suites */
  clear(): void {
    this.store.clear();
  }
}
