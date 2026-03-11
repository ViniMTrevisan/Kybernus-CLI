import { InMemoryUserRepository } from '../../persistence/in-memory/user.memory.repository';
import { PrismaUserRepository } from '../../persistence/prisma/auth/user.prisma.repository';
import { TokenService } from '../../services/token/token.service';
import { AuthService } from '../../../application/auth/auth.service';
import { prisma } from '../../persistence/prisma-client';
import { InMemoryTokenBlacklist } from '../../services/token/token.blacklist';
import { RedisTokenBlacklist } from '../../services/token/redis.token.blacklist';
import { redis } from '../../cache/redis';
import { emailService } from '../../services/email/email.registry';

/**
 * Module-level singletons.
 * Uses PrismaUserRepository when DATABASE_URL is set (production / integration
 * tests). Falls back to InMemoryUserRepository when NODE_ENV is 'test' without
 * a DATABASE_URL, or when NODE_ENV is 'test-inmemory'.
 */
const useDb =
  Boolean(process.env['DATABASE_URL']) &&
  process.env['NODE_ENV'] !== 'test-inmemory';

export const userRepository = useDb
  ? new PrismaUserRepository(prisma)
  : new InMemoryUserRepository();

const useRedis =
  Boolean(process.env['REDIS_URL']) &&
  process.env['NODE_ENV'] !== 'test-inmemory';

const blacklist = useRedis
  ? new RedisTokenBlacklist(redis)
  : new InMemoryTokenBlacklist();

export const tokenService = new TokenService(blacklist, useDb ? prisma : undefined);
export const authService = new AuthService(userRepository, tokenService, emailService);
