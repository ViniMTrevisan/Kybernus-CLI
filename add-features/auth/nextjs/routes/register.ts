import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth/jwt';
import { sessionCookieOptions } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';

// ==========================================
// 🚨 TODO: DATABASE INTEGRATION REQUIRED 🚨
// ==========================================
const mockDb: any[] = []; // 🚨 REPLACE THIS WITH REAL DB CALLS (e.g. Prisma) 🚨

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // 🚨 TODO: Replace with real db call (e.g. prisma.user.findUnique)
        const existingUser = mockDb.find((u) => u.email === email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // 🚨 TODO: Replace with real db call (e.g. prisma.user.create)
        const newUser = {
            id: Math.random().toString(36).substring(7),
            email,
            password: hashedPassword,
        };
        mockDb.push(newUser);

        const token = generateToken({ userId: newUser.id, email: newUser.email });

        const response = NextResponse.json(
            { user: { id: newUser.id, email: newUser.email } },
            { status: 201 }
        );

        // Set the cookie
        response.cookies.set('token', token, sessionCookieOptions);

        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
