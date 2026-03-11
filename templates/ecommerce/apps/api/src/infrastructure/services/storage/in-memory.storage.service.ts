import type { IStorageService } from '../../../application/ports/storage.port';

/**
 * In-memory storage — used in tests and when S3_BUCKET is not configured.
 * Files are never persisted; returns a deterministic fake URL.
 */
export class InMemoryStorageService implements IStorageService {
  async upload(key: string, _buffer: Buffer, _mimetype: string): Promise<string> {
    return `http://storage.local/${key}`;
  }
}
