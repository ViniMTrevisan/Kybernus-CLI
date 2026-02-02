import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { licenseConsumeSchema } from '@/lib/validations/license';
import { rateLimit } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Rate limit: 10 project creations per minute per IP (prevent abuse)
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`consume:${ip}`, 10, 60);
        if (!rateLimitResult.allowed) {
            console.warn(`[SECURITY] Rate limit exceeded for project consumption from ${ip}`);
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        const validation = licenseConsumeSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.message },
                { status: 400 }
            );
        }

        const { licenseKey } = validation.data;

        const result = await licenseService.consumeProjectCredit(licenseKey);

        if (!result.authorized) {
            return NextResponse.json(result, { status: 403 });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Consume error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
