import { AuthService } from '../auth.service';
import { IUserRepository } from '../user.repository';
import { ITokenService } from '../token.service';
import { IEmailService } from '../../../shared/infra/email/IEmailService';
import { UserEntity } from '../user.entity';

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeUser = (overrides: Partial<Parameters<typeof UserEntity.create>[0]> = {}) =>
  UserEntity.create({
    name: 'Test User',
    email: 'test@email.com',
    passwordHash: '$2a$10$hashedpassword',
    ...overrides,
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
describe('AuthService — Unit', () => {
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

  // ── register ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('deve criar usuário com role CUSTOMER por padrão', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockImplementation(async (user) => user);

      const result = await authService.register({
        name: 'João Silva',
        email: 'joao@email.com',
        password: 'senha1234',
      });

      expect(result.role).toBe('CUSTOMER');
      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });

    it('deve hashear a senha antes de salvar (não persiste senha em texto plano)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockImplementation(async (user) => user);

      await authService.register({
        name: 'João',
        email: 'joao@email.com',
        password: 'senha1234',
      });

      const persistedUser = userRepository.create.mock.calls[0][0];
      expect(persistedUser.passwordHash).not.toBe('senha1234');
      expect(persistedUser.passwordHash).toMatch(/^\$2[ab]\$/); // bcryptjs format
    });

    it('deve lançar ConflictError se email já estiver cadastrado', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());

      await expect(
        authService.register({ name: 'João', email: 'test@email.com', password: 'senha1234' }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('deve lançar ValidationError se senha tiver menos de 8 caracteres', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.register({ name: 'João', email: 'joao@email.com', password: '123' }),
      ).rejects.toMatchObject({ statusCode: 422 });
    });
  });

  // ── login ────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('deve retornar accessToken e refreshToken para credenciais válidas', async () => {
      // bcryptjs hash of "senha1234"
      const { hash } = await import('bcryptjs');
      const passwordHash = await hash('senha1234', 10);
      const user = UserEntity.create({ name: 'João', email: 'joao@email.com', passwordHash });

      userRepository.findByEmail.mockResolvedValue(user);
      tokenService.generateAccessToken.mockReturnValue('access-token');
      tokenService.generateRefreshToken.mockReturnValue('refresh-token');

      const result = await authService.login({ email: 'joao@email.com', password: 'senha1234' });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('deve lançar UnauthorizedError para senha incorreta', async () => {
      const { hash } = await import('bcryptjs');
      const passwordHash = await hash('senha1234', 10);
      const user = UserEntity.create({ name: 'João', email: 'joao@email.com', passwordHash });

      userRepository.findByEmail.mockResolvedValue(user);

      await expect(
        authService.login({ email: 'joao@email.com', password: 'senha_errada' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('deve lançar UnauthorizedError para email inexistente', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'naoexiste@email.com', password: 'senha1234' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('NÃO deve expor passwordHash no retorno', async () => {
      const { hash } = await import('bcryptjs');
      const passwordHash = await hash('senha1234', 10);
      const user = UserEntity.create({ name: 'João', email: 'joao@email.com', passwordHash });

      userRepository.findByEmail.mockResolvedValue(user);
      tokenService.generateAccessToken.mockReturnValue('access-token');
      tokenService.generateRefreshToken.mockReturnValue('refresh-token');

      const result = await authService.login({ email: 'joao@email.com', password: 'senha1234' });

      expect((result.user as Record<string, unknown>)['passwordHash']).toBeUndefined();
    });
  });

  // ── refreshToken ─────────────────────────────────────────────────────────
  describe('refreshToken()', () => {
    it('deve emitir novo accessToken para refreshToken válido', async () => {
      const user = makeUser();
      tokenService.isRefreshTokenBlacklisted.mockResolvedValue(false);
      tokenService.verifyRefreshToken.mockReturnValue({ sub: user.id, email: user.email });
      userRepository.findById.mockResolvedValue(user);
      tokenService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
    });

    it('deve rejeitar refreshToken que está na blacklist (logout anterior)', async () => {
      tokenService.isRefreshTokenBlacklisted.mockResolvedValue(true);

      await expect(authService.refreshToken('blacklisted-token')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('deve rejeitar se verifyRefreshToken lançar erro (token expirado/inválido)', async () => {
      tokenService.isRefreshTokenBlacklisted.mockResolvedValue(false);
      tokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(authService.refreshToken('expired-token')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  // ── logout ───────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('deve invalidar o refreshToken na blacklist', async () => {
      tokenService.invalidateRefreshToken.mockResolvedValue(undefined);

      await authService.logout('refresh-token-to-invalidate');

      expect(tokenService.invalidateRefreshToken).toHaveBeenCalledWith(
        'refresh-token-to-invalidate',
      );
    });
  });

  // ── forgotPassword ───────────────────────────────────────────────────────
  describe('forgotPassword()', () => {
    it('deve SEMPRE retornar sucesso mesmo se email não existir (anti-enumeration)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      // Should NOT throw — prevents user enumeration attacks
      await expect(
        authService.forgotPassword({ email: 'inexistente@email.com' }),
      ).resolves.not.toThrow();
    });

    it('deve gerar token de reset e chamar o serviço de envio de email', async () => {
      const user = makeUser();
      userRepository.findByEmail.mockResolvedValue(user);
      tokenService.generatePasswordResetToken.mockResolvedValue('reset-token');

      await authService.forgotPassword({ email: 'test@email.com' });

      expect(tokenService.generatePasswordResetToken).toHaveBeenCalledWith(user.id);
      expect(emailService.send).toHaveBeenCalledTimes(1);
      const [to] = emailService.send.mock.calls[0];
      expect(to).toBe('test@email.com');
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────
  describe('resetPassword()', () => {
    it('deve atualizar senha e invalidar o token de reset', async () => {
      const user = makeUser();
      tokenService.verifyPasswordResetToken.mockResolvedValue(user.id);
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockImplementation(async (u) => u);
      tokenService.invalidatePasswordResetToken.mockResolvedValue(undefined);

      await authService.resetPassword({ token: 'valid-reset-token', newPassword: 'newpassword1' });

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      const updatedUser = userRepository.update.mock.calls[0][0];
      expect(updatedUser.passwordHash).not.toBe('newpassword1');
      expect(tokenService.invalidatePasswordResetToken).toHaveBeenCalledWith('valid-reset-token');
    });

    it('deve rejeitar token de reset inválido/expirado', async () => {
      tokenService.verifyPasswordResetToken.mockRejectedValue(new Error('invalid token'));

      await expect(
        authService.resetPassword({ token: 'bad-token', newPassword: 'newpassword1' }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('deve lançar erro se nova senha tiver menos de 8 caracteres', async () => {
      await expect(
        authService.resetPassword({ token: 'valid-token', newPassword: '123' }),
      ).rejects.toMatchObject({ statusCode: 422 });
    });
  });
});
