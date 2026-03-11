import type { PrismaClient, User } from '@prisma/client';
import { UserEntity } from '../../../../domain/auth/user.entity';
import type { IUserRepository } from '../../../../domain/auth/user.repository';
import type { UserRole } from '../../../../domain/auth/user.entity';

function toEntity(row: User): UserEntity {
  return UserEntity.reconstitute({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role as UserRole,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? toEntity(row) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const row = await this.db.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
    return toEntity(row);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const row = await this.db.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });
    return toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  async findAll(
    opts: { role?: UserRole; cursor?: string; limit?: number } = {},
  ): Promise<{ items: UserEntity[]; nextCursor: string | null }> {
    const limit = opts.limit ?? 20;

    const rows = await this.db.user.findMany({
      where: opts.role ? { role: opts.role } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(opts.cursor
        ? { cursor: { id: opts.cursor }, skip: 1 }
        : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]!.id : null;

    return { items: items.map(toEntity), nextCursor };
  }
}
