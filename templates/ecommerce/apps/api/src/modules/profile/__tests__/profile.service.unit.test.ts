import { hash } from 'bcryptjs';
import { ProfileService } from '../profile.service';
import { IUserRepository } from '../../auth/user.repository';
import { UserEntity } from '../../auth/user.entity';

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeUser = async (overrides: Partial<{ name: string; email: string; passwordHash: string }> = {}) => {
  const passwordHash = overrides.passwordHash ?? (await hash('senha1234', 10));
  return UserEntity.create({
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? 'test@email.com',
    passwordHash,
  });
};

// ── Mocks ────────────────────────────────────────────────────────────────────
const makeUserRepository = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe('ProfileService — Unit', () => {
  let profileService: ProfileService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = makeUserRepository();
    profileService = new ProfileService(userRepository);
  });

  // ── getProfile ────────────────────────────────────────────────────────────
  describe('getProfile()', () => {
    it('200: deve retornar perfil público do usuário', async () => {
      const user = await makeUser();
      userRepository.findById.mockResolvedValue(user);

      const profile = await profileService.getProfile(user.id);

      expect(profile.id).toBe(user.id);
      expect(profile.email).toBe(user.email);
      expect(profile).not.toHaveProperty('passwordHash');
    });

    it('404: deve lançar erro quando usuário não existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(profileService.getProfile('non-existent-id')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── updateProfile ─────────────────────────────────────────────────────────
  describe('updateProfile()', () => {
    it('deve atualizar nome do usuário', async () => {
      const user = await makeUser();
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockImplementation(async (u) => u);

      const result = await profileService.updateProfile(user.id, { name: 'Novo Nome' });

      expect(result.name).toBe('Novo Nome');
      expect(userRepository.update).toHaveBeenCalledTimes(1);
    });

    it('deve atualizar email do usuário quando não está em uso', async () => {
      const user = await makeUser();
      userRepository.findById.mockResolvedValue(user);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockImplementation(async (u) => u);

      const result = await profileService.updateProfile(user.id, { email: 'novo@email.com' });

      expect(result.email).toBe('novo@email.com');
    });

    it('409: deve lançar erro quando email já está em uso por outro usuário', async () => {
      const user = await makeUser({ email: 'original@email.com' });
      const other = await makeUser({ email: 'taken@email.com' });
      userRepository.findById.mockResolvedValue(user);
      userRepository.findByEmail.mockResolvedValue(other);

      await expect(
        profileService.updateProfile(user.id, { email: 'taken@email.com' }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('não deve chamar findByEmail quando o email não mudou', async () => {
      const user = await makeUser({ email: 'same@email.com' });
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockImplementation(async (u) => u);

      await profileService.updateProfile(user.id, { email: 'same@email.com' });

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('404: deve lançar erro quando usuário não existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        profileService.updateProfile('ghost', { name: 'New Name' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── changePassword ────────────────────────────────────────────────────────
  describe('changePassword()', () => {
    it('204: deve trocar a senha com sucesso', async () => {
      const user = await makeUser(); // passwordHash = bcrypt('senha1234')
      userRepository.findById.mockResolvedValue(user);
      userRepository.update.mockImplementation(async (u) => u);

      await expect(
        profileService.changePassword(user.id, {
          currentPassword: 'senha1234',
          newPassword: 'novasenha5678',
        }),
      ).resolves.toBeUndefined();

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      const saved = userRepository.update.mock.calls[0]![0];
      expect(saved.passwordHash).not.toBe(user.passwordHash);
    });

    it('401: deve lançar erro com senha atual incorreta', async () => {
      const user = await makeUser();
      userRepository.findById.mockResolvedValue(user);

      await expect(
        profileService.changePassword(user.id, {
          currentPassword: 'wrong-password',
          newPassword: 'novasenha5678',
        }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('400: deve lançar erro quando nova senha é muito curta', async () => {
      const user = await makeUser();
      userRepository.findById.mockResolvedValue(user);

      await expect(
        profileService.changePassword(user.id, {
          currentPassword: 'senha1234',
          newPassword: '123',
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  // ── deleteAccount ─────────────────────────────────────────────────────────
  describe('deleteAccount()', () => {
    it('204: deve deletar a conta com a senha correta', async () => {
      const user = await makeUser();
      userRepository.findById.mockResolvedValue(user);
      userRepository.delete.mockResolvedValue(undefined);

      await expect(profileService.deleteAccount(user.id, 'senha1234')).resolves.toBeUndefined();

      expect(userRepository.delete).toHaveBeenCalledWith(user.id);
    });

    it('401: deve lançar erro com senha incorreta', async () => {
      const user = await makeUser();
      userRepository.findById.mockResolvedValue(user);

      await expect(
        profileService.deleteAccount(user.id, 'wrong-password'),
      ).rejects.toMatchObject({ statusCode: 401 });

      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('404: deve lançar erro quando usuário não existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        profileService.deleteAccount('ghost', 'senha1234'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
