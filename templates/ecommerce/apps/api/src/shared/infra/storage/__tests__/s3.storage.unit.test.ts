/**
 * Unit tests for S3StorageService.
 * Mocks the AWS SDK so no real S3/MinIO is needed.
 */

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
}));

import { S3StorageService } from '../S3StorageService';

describe('S3StorageService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      S3_BUCKET: 'test-bucket',
      S3_REGION: 'us-east-1',
      S3_ENDPOINT: 'http://localhost:9000',
      AWS_ACCESS_KEY_ID: 'minioadmin',
      AWS_SECRET_ACCESS_KEY: 'minioadmin',
    };
    mockSend.mockClear();
    mockSend.mockResolvedValue({});
    jest.resetModules();
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('deve chamar PutObjectCommand com bucket, key e body corretos', async () => {
    const { S3StorageService: FreshService } = await import('../S3StorageService');
    const service = new FreshService();
    const buf = Buffer.from('image-data');

    await service.upload('products/abc/photo.jpg', buf, 'image/jpeg');

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    expect(PutObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'test-bucket',
        Key: 'products/abc/photo.jpg',
        Body: buf,
        ContentType: 'image/jpeg',
      }),
    );
  });

  it('deve retornar URL pública no formato correto', async () => {
    const { S3StorageService: FreshService } = await import('../S3StorageService');
    const service = new FreshService();

    const url = await service.upload('products/id/image.png', Buffer.from('x'), 'image/png');

    expect(url).toContain('test-bucket');
    expect(url).toContain('products/id/image.png');
  });

  it('deve propagar erro do S3 como AppError', async () => {
    mockSend.mockRejectedValue(new Error('Network error'));
    const { S3StorageService: FreshService } = await import('../S3StorageService');
    const service = new FreshService();

    await expect(
      service.upload('products/id/fail.jpg', Buffer.from('x'), 'image/jpeg'),
    ).rejects.toMatchObject({ statusCode: 500 });
  });
});
