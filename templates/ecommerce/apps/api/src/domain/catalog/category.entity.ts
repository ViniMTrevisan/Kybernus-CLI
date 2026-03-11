import { randomUUID } from 'crypto';

export interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
}

export class CategoryEntity {
  private constructor(private readonly props: CategoryProps) {}

  static create(input: CreateCategoryInput): CategoryEntity {
    if (!input.name.trim()) throw new Error('Category name is required');
    return new CategoryEntity({
      id: randomUUID(),
      name: input.name.trim(),
      slug: input.slug.toLowerCase(),
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: CategoryProps): CategoryEntity {
    return new CategoryEntity(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get slug(): string { return this.props.slug; }
  get description(): string | null { return this.props.description; }
  get parentId(): string | null { return this.props.parentId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  toRecord(): CategoryProps {
    return { ...this.props };
  }
}
