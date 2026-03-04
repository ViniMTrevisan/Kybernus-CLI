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
        const user = mockDb.find((u) => u.email === email);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = generateToken({ userId: user.id, email: user.email });

        const response = NextResponse.json({ success: true });

        // Set the cookie
        response.cookies.set('token', token, sessionCookieOptions);

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
