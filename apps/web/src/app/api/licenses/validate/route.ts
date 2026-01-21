import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { getCachedLicense, setCachedLicense, rateLimit } from '@/lib/redis';
import { licenseValidateSchema } from '@/lib/validations/license';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Rate limit: 60 validations per minute per IP (high volume allowed for frequent checks)
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`validate:${ip}`, 60, 60);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        const validation = licenseValidateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.message },
                { status: 400 }
            );
        }

        const { licenseKey } = validation.data;

        // Check cache first (5 min TTL for valid licenses)
        const cached = await getCachedLicense(licenseKey);
        if (cached && cached.valid) {
            return NextResponse.json(cached);
        }

        // Cache miss - query database
        const result = await licenseService.validate(licenseKey);

        // Cache valid licenses only
        if (result.valid) {
            await setCachedLicense(licenseKey, result, 300); // 5 min
        }

        if (!result.valid) {
            return NextResponse.json(result, { status: 401 });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

