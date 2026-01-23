import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { emailService } from '@/lib/email';
import { rateLimit } from '@/lib/redis';
import { registerSchema } from '@/lib/validations/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// CORS headers for CLI access
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

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
                { status: 429, headers: corsHeaders }
            );
        }

        const body = await request.json();

        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.message },
                { status: 400, headers: corsHeaders }
            );
        }

        const { email, password } = validation.data;

        // Verifica se já existe
        const existing = await licenseService.findByEmail(email);
        if (existing) {
            return NextResponse.json({
                error: 'Email already registered',
                licenseKey: existing.licenseKey,
                status: existing.status,
            }, { status: 400, headers: corsHeaders });
        }

        // Cria trial
        const user = await licenseService.createTrialUser(email, password);

        // Send welcome email with license key
        await emailService.sendWelcome(email, user.licenseKey);

        return NextResponse.json({
            success: true,
            licenseKey: user.licenseKey,
            tier: user.tier.toLowerCase(),
            status: user.status,
            trialStartedAt: user.trialStartedAt,
            trialEndsAt: user.trialEndsAt,
            message: 'Trial activated with 3 project limit',
        }, { status: 201, headers: corsHeaders });

    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

