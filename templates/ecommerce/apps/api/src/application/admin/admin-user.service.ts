import type { IUserRepository } from '../../domain/auth/user.repository';
import type { UserRole } from '../../domain/auth/user.entity';
import { AppError } from '../../domain/shared/AppError';

export class AdminUserService {
  constructor(private readonly userRepo: IUserRepository) {}

  async listUsers(opts?: { role?: UserRole; cursor?: string; limit?: number }) {
    return this.userRepo.findAll(opts);
  }

  async updateUserRole(
    targetId: string,
    newRole: UserRole,
    requesterId: string,
  ): Promise<void> {
    if (targetId === requesterId) {
      throw new AppError('Não é possível alterar o próprio role', 403);
    }
    const user = await this.userRepo.findById(targetId);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    await this.userRepo.update(user.withRole(newRole));
  }
}
