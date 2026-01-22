import { NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/auth';
import { rateLimit } from '@/lib/redis';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Rate limit: 5 attempts per 5 minutes to prevent brute force
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`admin-login:${ip}`, 5, 300);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const { email, password } = await request.json();

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) {
            console.error('ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Use bcrypt.compare for secure password verification
        const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

        if (email === adminEmail && isValidPassword) {
            const token = signAdminToken(email);

            const response = NextResponse.json({
                success: true,
                token,
                message: 'Login successful'
            });

            // Set HTTP-only cookie for better security
            response.cookies.set('admin-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );

    } catch (error: any) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
