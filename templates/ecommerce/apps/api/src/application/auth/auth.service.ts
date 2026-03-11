import { hash, compare } from 'bcryptjs';
import { IUserRepository } from '../../domain/auth/user.repository';
import { ITokenService, TokenPayload } from '../ports/token.port';
import { UserEntity, PublicUser } from '../../domain/auth/user.entity';
import { AppError } from '../../domain/shared/AppError';
import { IEmailService } from '../ports/email.port';

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

// ── Service ───────────────────────────────────────────────────────────────────
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly emailService: IEmailService,
  ) {}

  // ── register ─────────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<PublicUser> {
    if (dto.password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`, 422);
    }

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new AppError('Email já cadastrado', 409);
    }

    const passwordHash = await hash(dto.password, BCRYPT_ROUNDS);
    const user = UserEntity.create({ name: dto.name, email: dto.email, passwordHash });
    const saved = await this.userRepository.create(user);

    return saved.toPublic();
  }

  // ── login ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const passwordMatch = await compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return { accessToken, refreshToken, user: user.toPublic() };
  }

  // ── refreshToken ──────────────────────────────────────────────────────────
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const blacklisted = await this.tokenService.isRefreshTokenBlacklisted(token);
    if (blacklisted) {
      throw new AppError('Refresh token inválido', 401);
    }

    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(token);
    } catch {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new AppError('Usuário não encontrado', 401);
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  }

  // ── logout ────────────────────────────────────────────────────────────────
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.invalidateRefreshToken(refreshToken);
  }

  // ── forgotPassword ────────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);

    // Always return success — prevents user enumeration
    if (!user) return;

    const resetToken = await this.tokenService.generatePasswordResetToken(user.id);
    const resetUrl = `${process.env['FRONTEND_URL'] ?? 'http://localhost:5174'}/reset-password?token=${resetToken}`;
    const html = buildPasswordResetEmail(user.name, resetUrl);
    await this.emailService.send(user.email, 'Recuperação de senha', html);
  }

  // ── resetPassword ─────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`, 422);
    }

    let userId: string;
    try {
      userId = await this.tokenService.verifyPasswordResetToken(dto.token);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Token de recuperação inválido ou expirado', 400);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 400);
    }

    const newHash = await hash(dto.newPassword, BCRYPT_ROUNDS);
    const updated = user.withPasswordHash(newHash);
    await this.userRepository.update(updated);
    await this.tokenService.invalidatePasswordResetToken(dto.token);
  }
}

// ── Email template ────────────────────────────────────────────────────────────
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPasswordResetEmail(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px;">
    <h2 style="color: #1a1a2e; margin-top: 0;">Recuperação de senha</h2>
    <p>Olá, <strong>${escapeHtml(name)}</strong>!</p>
    <p>Você solicitou a recuperação de senha. Clique no botão abaixo para redefinir:</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}"
         style="background:#6366f1;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">
        Redefinir senha
      </a>
    </p>
    <p style="font-size:13px;color:#555;">Este link expira em 1 hora. Se você não solicitou isso, ignore este email.</p>
  </div>
</body>
</html>
  `.trim();
}
