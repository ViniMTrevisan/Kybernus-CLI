import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';

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
