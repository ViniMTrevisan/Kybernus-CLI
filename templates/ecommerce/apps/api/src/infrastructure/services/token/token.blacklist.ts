import type { ITokenBlacklist } from '../../../application/ports/token-blacklist.port';

/**
 * In-process implementation used for unit tests and dev when Redis is not
 * available. Honors TTL via timestamp comparison.
 */
export class InMemoryTokenBlacklist implements ITokenBlacklist {
  /** jti → expiry epoch-ms (0 = never expires) */
  private readonly store = new Map<string, number>();

  async add(jti: string, ttlSeconds: number): Promise<void> {
    const expiry = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    this.store.set(jti, expiry);
  }

  async has(jti: string): Promise<boolean> {
    const expiry = this.store.get(jti);
    if (expiry === undefined) return false;
    if (expiry !== 0 && Date.now() > expiry) {
      this.store.delete(jti);
      return false;
    }
    return true;
  }

  /** Used in tests to reset state between cases. */
  clear(): void {
    this.store.clear();
  }
}
