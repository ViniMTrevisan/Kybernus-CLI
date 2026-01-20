import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Always return success even if user not found (security best practice)
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists, a reset link has been sent.',
            });
        }

        // Generate secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token
        await prisma.passwordResetToken.create({
            data: {
                email,
                token: resetToken,
                expiresAt,
            },
        });

        // Send email
        await emailService.sendPasswordReset(email, resetToken);

        return NextResponse.json({
            success: true,
            message: 'If an account exists, a reset link has been sent.',
        });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
