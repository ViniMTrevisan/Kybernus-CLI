export interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
  jti?: string;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): string;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  invalidateRefreshToken(token: string): Promise<undefined>;
  isRefreshTokenBlacklisted(token: string): Promise<boolean>;
  generatePasswordResetToken(userId: string): Promise<string>;
  verifyPasswordResetToken(token: string): Promise<string>;
  invalidatePasswordResetToken(token: string): Promise<undefined>;
}
