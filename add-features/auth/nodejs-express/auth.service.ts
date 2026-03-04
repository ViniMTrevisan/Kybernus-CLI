import { generateToken } from './jwt.config';
import bcrypt from 'bcryptjs';

// ==========================================
// 🚨 TODO: DATABASE INTEGRATION REQUIRED 🚨
// ==========================================
// This service currently uses an IN-MEMORY array to store users.
// You MUST replace the "mockDb" logic below with your actual ORM or Database provider.
//
// EXAMPLE WITH PRISMA:
// 1. import { PrismaClient } from '@prisma/client';
//    const prisma = new PrismaClient();
// 2. To find user: const user = await prisma.user.findUnique({ where: { email } });
// 3. To create user: const user = await prisma.user.create({ data: { email, password: hashedPassword } });
// ==========================================

const mockDb: any[] = []; // 🚨 REPLACE THIS WITH REAL DB CALLS 🚨

export class AuthService {

    async register(email: string, password: string) {
        // 🚨 TODO: Change this to checking your real database!
        const existingUser = mockDb.find((u) => u.email === email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // 🚨 TODO: Change this to inserting into your real database!
        const newUser = {
            id: Math.random().toString(36).substring(7), // Mock ID
            email,
            password: hashedPassword,
        };
        mockDb.push(newUser);

        const token = generateToken({ userId: newUser.id, email: newUser.email });

        // Do not return password hash
        const { password: _, ...userWithoutPassword } = newUser;
        return { user: userWithoutPassword, token };
    }

    async login(email: string, password: string) {
        // 🚨 TODO: Change this to fetching from your real database!
        const user = mockDb.find((u) => u.email === email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = generateToken({ userId: user.id, email: user.email });

        return { token };
    }

    async getUserProfile(userId: string) {
        // 🚨 TODO: Change this to fetching from your real database!
        const user = mockDb.find((u) => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        const { password, ...profile } = user;
        return profile;
    }
}
