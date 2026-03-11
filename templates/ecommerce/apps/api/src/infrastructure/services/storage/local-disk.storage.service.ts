import fs from 'fs';
import path from 'path';
import type { IStorageService } from '../../../application/ports/storage.port';

/**
 * LocalDiskStorageService — persists uploaded files to the local filesystem
 * under `apps/api/public/uploads/`. Used for local development when neither
 * S3 nor MinIO is configured.
 *
 * Files are served by the Express static middleware at /public/uploads/<key>.
 */
export class LocalDiskStorageService implements IStorageService {
  private readonly uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir =
      uploadDir ?? path.join(__dirname, '../../../../../public/uploads');
  }

  async upload(key: string, buffer: Buffer, _mimetype: string): Promise<string> {
    fs.mkdirSync(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, key);
    fs.writeFileSync(filePath, buffer);
    const baseUrl = process.env['BASE_URL'] ?? 'http://localhost:3000';
    return `${baseUrl}/public/uploads/${key}`;
  }
}
