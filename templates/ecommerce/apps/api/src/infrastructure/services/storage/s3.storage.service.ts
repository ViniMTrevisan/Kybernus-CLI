import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { IStorageService } from '../../../application/ports/storage.port';
import { AppError } from '../../../domain/shared/AppError';

/**
 * S3-compatible storage service.
 * Points to AWS S3 in production.
 * In dev/CI, override S3_ENDPOINT to use MinIO (http://localhost:9000).
 */
export class S3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor() {
    this.bucket = process.env['S3_BUCKET'] ?? 'products';
    const region = process.env['S3_REGION'] ?? 'us-east-1';
    const endpoint = process.env['S3_ENDPOINT'];

    this.client = new S3Client({
      region,
      ...(endpoint
        ? { endpoint, forcePathStyle: true }
        : {}),
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
      },
    });

    // Public URL base: MinIO-style (endpoint/bucket) or S3 virtual-hosted
    this.publicBase = endpoint
      ? `${endpoint}/${this.bucket}`
      : `https://${this.bucket}.s3.${region}.amazonaws.com`;
  }

  async upload(key: string, buffer: Buffer, mimetype: string): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimetype,
        }),
      );
      return `${this.publicBase}/${key}`;
    } catch {
      throw new AppError('Falha ao fazer upload da imagem', 500);
    }
  }
}
