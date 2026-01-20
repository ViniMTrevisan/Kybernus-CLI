import { NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPass) {
            console.error('ADMIN_EMAIL or ADMIN_PASSWORD not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        if (email === adminEmail && password === adminPass) {
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
