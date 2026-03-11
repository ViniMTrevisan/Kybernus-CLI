import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../user.prisma.repository';
import { UserEntity } from '../user.entity';

// DATABASE_URL is set to ecommerce_test by setup.db.ts (setupFiles)
const db = new PrismaClient();
const repo = new PrismaUserRepository(db);

async function cleanDb() {
  await db.$executeRaw`TRUNCATE TABLE password_reset_tokens, users RESTART IDENTITY CASCADE`;
}

beforeAll(async () => {
  await db.$connect();
});

afterAll(async () => {
  await cleanDb();
  await db.$disconnect();
});

beforeEach(async () => {
  await cleanDb();
});

describe('PrismaUserRepository', () => {
  it('create: deve persistir e reconstituir UserEntity', async () => {
    const user = UserEntity.create({
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: '$2b$10$hashedpw',
    });

    const saved = await repo.create(user);

    expect(saved.id).toBe(user.id);
    expect(saved.name).toBe('Alice');
    expect(saved.email).toBe('alice@example.com');
    expect(saved.role).toBe('CUSTOMER');
  });

  it('findByEmail: deve retornar null para email inexistente', async () => {
    const result = await repo.findByEmail('ghost@example.com');
    expect(result).toBeNull();
  });

  it('findByEmail: deve retornar entidade para email existente', async () => {
    const user = UserEntity.create({
      name: 'Bob',
      email: 'bob@example.com',
      passwordHash: '$2b$10$hashedpw',
    });
    await repo.create(user);

    const found = await repo.findByEmail('bob@example.com');

    expect(found).not.toBeNull();
    expect(found!.email).toBe('bob@example.com');
    expect(found!.id).toBe(user.id);
  });

  it('findById: deve retornar null para id inexistente', async () => {
    const result = await repo.findById('00000000-0000-0000-0000-000000000000');
    expect(result).toBeNull();
  });

  it('findById: deve retornar entidade para id existente', async () => {
    const user = UserEntity.create({
      name: 'Carol',
      email: 'carol@example.com',
      passwordHash: '$2b$10$hashedpw',
    });
    await repo.create(user);

    const found = await repo.findById(user.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(user.id);
  });

  it('update: deve persistir alterações de role', async () => {
    const user = UserEntity.create({
      name: 'Dave',
      email: 'dave@example.com',
      passwordHash: '$2b$10$hashedpw',
    });
    await repo.create(user);

    const promoted = user.withRole('ADMIN');
    const updated = await repo.update(promoted);

    expect(updated.role).toBe('ADMIN');

    const fetched = await repo.findById(user.id);
    expect(fetched!.role).toBe('ADMIN');
  });

  it('findAll: deve paginar com cursor', async () => {
    const users = await Promise.all(
      ['u1@test.com', 'u2@test.com', 'u3@test.com'].map((email) =>
        repo.create(
          UserEntity.create({ name: email, email, passwordHash: 'pw' }),
        ),
      ),
    );

    const page1 = await repo.findAll({ limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await repo.findAll({ cursor: page1.nextCursor!, limit: 2 });
    expect(page2.items).toHaveLength(1);
    expect(page2.nextCursor).toBeNull();

    const allIds = [...page1.items, ...page2.items].map((u) => u.id);
    expect(allIds).toEqual(expect.arrayContaining(users.map((u) => u.id)));
  });

  it('findAll: deve filtrar por role', async () => {
    const customer = UserEntity.create({
      name: 'Cust',
      email: 'cust@test.com',
      passwordHash: 'pw',
    });
    const admin = UserEntity.create({
      name: 'Adm',
      email: 'adm@test.com',
      passwordHash: 'pw',
    }).withRole('ADMIN');

    await repo.create(customer);
    await repo.create(admin);

    const { items } = await repo.findAll({ role: 'ADMIN' });
    expect(items).toHaveLength(1);
    expect(items[0]!.role).toBe('ADMIN');
  });
});
