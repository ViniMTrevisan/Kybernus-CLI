import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

// ==========================================
// 🚨 TODO: DATABASE INTEGRATION REQUIRED 🚨
// ==========================================
// This service currently uses an IN-MEMORY array to store users.
// You MUST replace "this.mockDb" logic with your actual ORM or Repository provider.
//
// EXAMPLE WITH PRISMA/TYPEORM:
// 1. Inject your repository in the constructor:
//    constructor(private usersService: UsersService, private jwtService: JwtService) {}
// 2. Change register() to: await this.usersService.create(email, hashedPassword);
// 3. Change login() to: await this.usersService.findByEmail(email);
// ==========================================

@Injectable()
export class AuthService {
    private mockDb = []; // 🚨 REPLACE THIS WITH REAL DB CALLS 🚨

    constructor(private jwtService: JwtService) { }

    async register(email: string, pass: string) {
        // 🚨 TODO: Change this to checking your real database!
        const existingUser = this.mockDb.find((u) => u.email === email);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(pass, 12);

        // 🚨 TODO: Change this to inserting into your real database!
        const newUser = {
            id: Math.random().toString(36).substring(7),
            email,
            password: hashedPassword,
        };
        this.mockDb.push(newUser);

        const payload = { userId: newUser.id, email: newUser.email };
        const { password, ...userResult } = newUser;

        return {
            user: userResult,
            access_token: this.jwtService.sign(payload),
        };
    }

    async login(email: string, pass: string) {
        // 🚨 TODO: Change this to fetching from your real database!
        const user = this.mockDb.find((u) => u.email === email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { userId: user.id, email: user.email };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async getUserProfile(userId: string) {
        // 🚨 TODO: Change this to fetching from your real database!
        const user = this.mockDb.find((u) => u.id === userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { password, ...result } = user;
        return result;
    }
}
