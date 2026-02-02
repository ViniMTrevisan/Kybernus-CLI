import { NextResponse } from 'next/server';
import { signUserToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { loginSchema } from '@/lib/validations/auth';
import { rateLimit } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Rate limit: 5 failed attempts per minute per IP to prevent brute force
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`login:${ip}`, 5, 60);
        if (!rateLimitResult.allowed) {
            console.warn(`[SECURITY] Rate limit exceeded for login from ${ip}`);
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Validate input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.message },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password hash
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.warn(`[SECURITY] Failed login attempt for ${email} from ${ip}`);
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signUserToken(email);

        const response = NextResponse.json({
            success: true,
            token,
            message: 'Login successful'
        });

        // Set HTTP-only cookie
        response.cookies.set('user-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
