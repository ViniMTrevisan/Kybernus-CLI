import type { PrismaClient, Category } from '@prisma/client';
import { CategoryEntity } from '../../../../domain/catalog/category.entity';
import type { ICategoryRepository } from '../../../../domain/catalog/category.repository';

function toEntity(row: Category): CategoryEntity {
  return CategoryEntity.reconstitute({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parentId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string): Promise<CategoryEntity | null> {
    const row = await this.db.category.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const row = await this.db.category.findUnique({ where: { slug } });
    return row ? toEntity(row) : null;
  }

  async findAll(): Promise<CategoryEntity[]> {
    const rows = await this.db.category.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(toEntity);
  }

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    const row = await this.db.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
    return toEntity(row);
  }

  async update(category: CategoryEntity): Promise<CategoryEntity> {
    const row = await this.db.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
      },
    });
    return toEntity(row);
  }

  async delete(id: string): Promise<undefined> {
    await this.db.category.delete({ where: { id } });
    return undefined;
  }
}
