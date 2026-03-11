export interface IStorageService {
  upload(key: string, buffer: Buffer, mimetype: string): Promise<string>;
}
