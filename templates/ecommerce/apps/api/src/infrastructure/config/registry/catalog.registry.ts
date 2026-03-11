import { InMemoryCategoryRepository } from '../../persistence/in-memory/category.memory.repository';
import { InMemoryProductRepository } from '../../persistence/in-memory/product.memory.repository';
import { PrismaCategoryRepository } from '../../persistence/prisma/catalog/category.prisma.repository';
import { PrismaProductRepository } from '../../persistence/prisma/catalog/product.prisma.repository';
import { CatalogService } from '../../../application/catalog/catalog.service';
import { prisma } from '../../persistence/prisma-client';
import { storageService } from '../../services/storage/storage.registry';

const useDb =
  Boolean(process.env['DATABASE_URL']) &&
  process.env['NODE_ENV'] !== 'test-inmemory';

export const categoryRepository = useDb
  ? new PrismaCategoryRepository(prisma)
  : new InMemoryCategoryRepository();

export const productRepository = useDb
  ? new PrismaProductRepository(prisma)
  : new InMemoryProductRepository();

export const catalogService = new CatalogService(categoryRepository, productRepository, storageService);

// Named export for test setup access
export const catalogRegistry = { categoryRepository, productRepository, catalogService };
