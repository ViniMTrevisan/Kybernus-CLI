import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { AppError } from '../../../domain/shared/AppError';
import { InMemoryTokenBlacklist } from './token.blacklist';
import type { ITokenBlacklist } from '../../../application/ports/token-blacklist.port';
import type { ITokenService, TokenPayload } from '../../../application/ports/token.port';
import type { PrismaClient } from '@prisma/client';

export class TokenService implements ITokenService {
  // in-memory fallback used in tests (no DB)
  private readonly resetTokensFallback = new Map<string, string>();

  constructor(
    private readonly blacklist: ITokenBlacklist = new InMemoryTokenBlacklist(),
    private readonly prismaClient?: PrismaClient,
  ) {}

  private get jwtSecret(): string {
    const s = process.env['JWT_SECRET'];
    if (!s) throw new Error('JWT_SECRET is not set');
    return s;
  }

  private get jwtRefreshSecret(): string {
    const s = process.env['JWT_REFRESH_SECRET'];
    if (!s) throw new Error('JWT_REFRESH_SECRET is not set');
    return s;
  }

  private get jwtResetSecret(): string {
    const s = process.env['JWT_RESET_SECRET'] ?? process.env['JWT_SECRET'];
    if (!s) throw new Error('JWT_RESET_SECRET is not set');
    return s;
  }

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: (process.env['JWT_EXPIRES_IN'] as jwt.SignOptions['expiresIn']) ?? '15m',
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      { ...payload, jti: randomUUID() },
      this.jwtRefreshSecret,
      {
        expiresIn:
          (process.env['JWT_REFRESH_EXPIRES_IN'] as jwt.SignOptions['expiresIn']) ?? '7d',
      },
    );
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch {
      throw new AppError('Token inválido ou expirado', 401);
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.jwtRefreshSecret) as TokenPayload;
  }

  async invalidateRefreshToken(token: string): Promise<undefined> {
    const decoded = jwt.decode(token) as (TokenPayload & { exp?: number }) | null;
    const jti = decoded?.jti;
    if (!jti) return undefined;
    const exp = decoded?.exp ?? 0;
    const ttlSeconds = Math.max(0, exp - Math.floor(Date.now() / 1000));
    await this.blacklist.add(jti, ttlSeconds);
    return undefined;
  }

  async isRefreshTokenBlacklisted(token: string): Promise<boolean> {
    const decoded = jwt.decode(token) as (TokenPayload & { exp?: number }) | null;
    const jti = decoded?.jti;
    if (!jti) return false;
    return this.blacklist.has(jti);
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = jwt.sign({ sub: userId }, this.jwtResetSecret, { expiresIn: '1h' });
    if (this.prismaClient) {
      // Invalidate any existing tokens for this user, then create a new one
      await this.prismaClient.passwordResetToken.deleteMany({ where: { userId } });
      await this.prismaClient.passwordResetToken.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });
    } else {
      this.resetTokensFallback.set(token, userId);
    }
    return token;
  }

  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const payload = jwt.verify(token, this.jwtResetSecret) as { sub: string };
      if (this.prismaClient) {
        const record = await this.prismaClient.passwordResetToken.findUnique({
          where: { token },
        });
        if (!record || record.usedAt !== null) {
          throw new AppError('Token de recuperação inválido ou já utilizado', 400);
        }
        if (record.expiresAt < new Date()) {
          throw new AppError('Token de recuperação expirado', 400);
        }
        return record.userId;
      } else {
        const storedUserId = this.resetTokensFallback.get(token);
        if (!storedUserId) throw new Error('Token not found');
        return payload.sub;
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Token de recuperação inválido ou expirado', 400);
    }
  }

  async invalidatePasswordResetToken(token: string): Promise<undefined> {
    if (this.prismaClient) {
      await this.prismaClient.passwordResetToken.updateMany({
        where: { token },
        data: { usedAt: new Date() },
      });
    } else {
      this.resetTokensFallback.delete(token);
    }
    return undefined;
  }
}
