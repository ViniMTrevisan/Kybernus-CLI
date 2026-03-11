import type { Redis } from 'ioredis';
import type { ITokenBlacklist } from '../../../application/ports/token-blacklist.port';

const KEY_PREFIX = 'blacklist:';

/**
 * Redis-backed token blacklist.
 * Uses a simple SET with EX (TTL) — the key expires automatically, so no
 * manual cleanup is needed.
 */
export class RedisTokenBlacklist implements ITokenBlacklist {
  constructor(private readonly redis: Redis) {}

  async add(jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return; // token already expired — nothing to store
    await this.redis.set(`${KEY_PREFIX}${jti}`, '1', 'EX', ttlSeconds);
  }

  async has(jti: string): Promise<boolean> {
    const val = await this.redis.get(`${KEY_PREFIX}${jti}`);
    return val !== null;
  }
}
