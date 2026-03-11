import type { IStorageService } from '../../../application/ports/storage.port';
import { S3StorageService } from './s3.storage.service';
import { InMemoryStorageService } from './in-memory.storage.service';
import { LocalDiskStorageService } from './local-disk.storage.service';

const env = process.env['NODE_ENV'];

/**
 * Picks the storage implementation:
 *   test / test-inmemory → InMemoryStorageService (no disk I/O in tests)
 *   S3_BUCKET set        → S3StorageService (real S3 or MinIO)
 *   Otherwise            → LocalDiskStorageService (dev without MinIO)
 */
export const storageService: IStorageService =
  env === 'test' || env === 'test-inmemory'
    ? new InMemoryStorageService()
    : process.env['S3_BUCKET']
      ? new S3StorageService()
      : new LocalDiskStorageService();
