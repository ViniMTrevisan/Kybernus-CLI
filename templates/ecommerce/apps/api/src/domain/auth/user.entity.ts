import { randomUUID } from 'crypto';
import { z } from 'zod';
import { AppError } from '../shared/AppError';

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  // Allow casting to Record<string, unknown> in tests to verify absent keys
  [key: string]: unknown;
}

// ── Validation schemas ────────────────────────────────────────────────────────
const emailSchema = z.string().email('Email inválido');
const nameSchema = z.string().trim().min(1, 'Nome não pode ser vazio');

// ── Entity ────────────────────────────────────────────────────────────────────
export class UserEntity {
  private constructor(private readonly props: UserProps) {}

  // ── Factories ──────────────────────────────────────────────────────────────
  static create(input: CreateUserInput): UserEntity {
    const emailResult = emailSchema.safeParse(input.email);
    if (!emailResult.success) {
      throw new AppError(emailResult.error.errors[0]?.message ?? 'Email inválido', 422);
    }

    const nameResult = nameSchema.safeParse(input.name);
    if (!nameResult.success) {
      throw new AppError(nameResult.error.errors[0]?.message ?? 'Nome inválido', 422);
    }

    return new UserEntity({
      id: randomUUID(),
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role ?? 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  // ── Getters ────────────────────────────────────────────────────────────────
  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get email(): string { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get role(): UserRole { return this.props.role; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  withPasswordHash(hash: string): UserEntity {
    return new UserEntity({ ...this.props, passwordHash: hash, updatedAt: new Date() });
  }

  withName(name: string): UserEntity {
    return new UserEntity({ ...this.props, name: name.trim(), updatedAt: new Date() });
  }

  withEmail(email: string): UserEntity {
    return new UserEntity({ ...this.props, email: email.toLowerCase(), updatedAt: new Date() });
  }

  withRole(role: UserRole): UserEntity {
    return new UserEntity({ ...this.props, role, updatedAt: new Date() });
  }

  // ── Projections ────────────────────────────────────────────────────────────
  toPublic(): PublicUser {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      role: this.props.role,
      createdAt: this.props.createdAt,
    };
  }

  toRecord(): UserProps {
    return { ...this.props };
  }
}
