import { compare, hash } from 'bcryptjs';
import { IUserRepository } from '../../domain/auth/user.repository';
import { PublicUser } from '../../domain/auth/user.entity';
import { AppError } from '../../domain/shared/AppError';

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

const BCRYPT_ROUNDS = 10;

export class ProfileService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user.toPublic();
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado', 404);

    let updated = user;

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name.length < 2) throw new AppError('Nome deve ter pelo menos 2 caracteres', 400);
      updated = updated.withName(name);
    }

    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase();
      if (email !== user.email) {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) throw new AppError('Email já está em uso', 409);
      }
      updated = updated.withEmail(email);
    }

    const saved = await this.userRepository.update(updated);
    return saved.toPublic();
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const valid = await compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Senha atual incorreta', 401);

    if (dto.newPassword.length < 8) {
      throw new AppError('Nova senha deve ter pelo menos 8 caracteres', 400);
    }

    const newHash = await hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.userRepository.update(user.withPasswordHash(newHash));
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const valid = await compare(password, user.passwordHash);
    if (!valid) throw new AppError('Senha incorreta', 401);

    await this.userRepository.delete(userId);
  }
}
