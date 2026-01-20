import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { emailService } from '@/lib/email';
import { rateLimit } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Rate limit: 5 registrations per minute per IP
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const rateLimitResult = await rateLimit(`register:${ip}`, 5, 60);

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // Verifica se já existe
        const existing = await licenseService.findByEmail(email);
        if (existing) {
            return NextResponse.json({
                error: 'Email already registered',
                licenseKey: existing.licenseKey,
                status: existing.status,
            }, { status: 400 });
        }

        // Cria trial
        const user = await licenseService.createTrialUser(email);

        // Send welcome email with license key
        await emailService.sendWelcome(email, user.licenseKey);

        return NextResponse.json({
            success: true,
            licenseKey: user.licenseKey,
            tier: user.tier.toLowerCase(),
            status: user.status,
            trialStartedAt: user.trialStartedAt,
            trialEndsAt: user.trialEndsAt,
            message: 'Trial activated for 15 days',
        }, { status: 201 });

    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

