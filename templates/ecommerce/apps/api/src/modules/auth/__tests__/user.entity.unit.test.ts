import { UserEntity } from '../user.entity';

describe('UserEntity — Unit', () => {
  describe('create()', () => {
    it('deve criar um usuário com role CUSTOMER por padrão', () => {
      const user = UserEntity.create({
        name: 'João Silva',
        email: 'joao@email.com',
        passwordHash: 'hashed_password',
      });

      expect(user.role).toBe('CUSTOMER');
      expect(user.email).toBe('joao@email.com');
      expect(user.name).toBe('João Silva');
    });

    it('deve aceitar role ADMIN explicitamente', () => {
      const user = UserEntity.create({
        name: 'Admin User',
        email: 'admin@email.com',
        passwordHash: 'hashed_password',
        role: 'ADMIN',
      });

      expect(user.role).toBe('ADMIN');
    });

    it('deve gerar um id único para cada usuário criado', () => {
      const user1 = UserEntity.create({ name: 'A', email: 'a@a.com', passwordHash: 'h' });
      const user2 = UserEntity.create({ name: 'B', email: 'b@b.com', passwordHash: 'h' });

      expect(user1.id).not.toBe(user2.id);
    });

    it('deve lançar erro se email for inválido', () => {
      expect(() =>
        UserEntity.create({ name: 'A', email: 'not-an-email', passwordHash: 'h' }),
      ).toThrow();
    });

    it('deve lançar erro se name for vazio', () => {
      expect(() =>
        UserEntity.create({ name: '  ', email: 'a@a.com', passwordHash: 'h' }),
      ).toThrow();
    });
  });

  describe('reconstitute()', () => {
    it('deve reconstituir um usuário existente a partir de dados persistidos', () => {
      const user = UserEntity.reconstitute({
        id: 'existing-id',
        name: 'João',
        email: 'joao@email.com',
        passwordHash: 'hashed',
        role: 'CUSTOMER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(user.id).toBe('existing-id');
      expect(user.role).toBe('CUSTOMER');
    });
  });

  describe('toPublic()', () => {
    it('NÃO deve expor passwordHash no retorno público', () => {
      const user = UserEntity.create({
        name: 'João',
        email: 'joao@email.com',
        passwordHash: 'secret_hash',
      });

      const pub = user.toPublic();

      expect((pub as Record<string, unknown>)['passwordHash']).toBeUndefined();
      expect(pub.email).toBe('joao@email.com');
    });
  });
});
