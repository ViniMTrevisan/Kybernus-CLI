import { CategoryEntity, CategoryProps } from '../../../domain/catalog/category.entity';
import type { ICategoryRepository } from '../../../domain/catalog/category.repository';

export class InMemoryCategoryRepository implements ICategoryRepository {
  private store = new Map<string, CategoryProps>();

  async findById(id: string): Promise<CategoryEntity | null> {
    const props = this.store.get(id);
    return props ? CategoryEntity.reconstitute(props) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    for (const props of this.store.values()) {
      if (props.slug === slug) return CategoryEntity.reconstitute(props);
    }
    return null;
  }

  async findAll(): Promise<CategoryEntity[]> {
    return Array.from(this.store.values()).map(CategoryEntity.reconstitute);
  }

  async create(category: CategoryEntity): Promise<CategoryEntity> {
    this.store.set(category.id, category.toRecord());
    return category;
  }

  async update(category: CategoryEntity): Promise<CategoryEntity> {
    this.store.set(category.id, category.toRecord());
    return category;
  }

  async delete(id: string): Promise<undefined> {
    this.store.delete(id);
    return undefined;
  }

  clear(): void {
    this.store.clear();
  }
}
