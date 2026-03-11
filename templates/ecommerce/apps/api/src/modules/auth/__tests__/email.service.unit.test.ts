import { AuthService } from '../auth.service';
import { IUserRepository } from '../user.repository';
import { ITokenService } from '../token.service';
import { IEmailService } from '../../../shared/infra/email/IEmailService';
import { UserEntity } from '../user.entity';

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeUser = () =>
  UserEntity.create({
    name: 'Ana Lima',
    email: 'ana@email.com',
    passwordHash: '$2a$10$hashedpassword',
  });

// ── Mocks ────────────────────────────────────────────────────────────────────
const makeUserRepository = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
});

const makeTokenService = (): jest.Mocked<ITokenService> => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  invalidateRefreshToken: jest.fn(),
  isRefreshTokenBlacklisted: jest.fn(),
  generatePasswordResetToken: jest.fn(),
  verifyPasswordResetToken: jest.fn(),
  invalidatePasswordResetToken: jest.fn(),
});

const makeEmailService = (): jest.Mocked<IEmailService> => ({
  send: jest.fn().mockResolvedValue(undefined),
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe('AuthService.forgotPassword() — com IEmailService mockado', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let emailService: jest.Mocked<IEmailService>;

  beforeEach(() => {
    userRepository = makeUserRepository();
    tokenService = makeTokenService();
    emailService = makeEmailService();
    authService = new AuthService(userRepository, tokenService, emailService);
  });

  it('deve chamar emailService.send() com o email correto do destinatário', async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);
    tokenService.generatePasswordResetToken.mockResolvedValue('tok-abc123');

    await authService.forgotPassword({ email: 'ana@email.com' });

    expect(emailService.send).toHaveBeenCalledTimes(1);
    const [to] = emailService.send.mock.calls[0];
    expect(to).toBe('ana@email.com');
  });

  it('deve incluir o token de reset na URL enviada', async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);
    tokenService.generatePasswordResetToken.mockResolvedValue('tok-abc123');

    await authService.forgotPassword({ email: 'ana@email.com' });

    const [, , html] = emailService.send.mock.calls[0];
    expect(html).toContain('tok-abc123');
    expect(html).toContain('reset-password');
  });

  it('deve retornar sucesso mesmo se email não existir (anti-enumeration)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.forgotPassword({ email: 'naoexiste@email.com' }),
    ).resolves.not.toThrow();
  });

  it('não deve chamar emailService.send() se usuário não existir', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await authService.forgotPassword({ email: 'naoexiste@email.com' });

    expect(emailService.send).not.toHaveBeenCalled();
  });
});
