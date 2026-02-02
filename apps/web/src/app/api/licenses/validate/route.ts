import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { getCachedLicense, setCachedLicense, rateLimit } from '@/lib/redis';
import { licenseValidateSchema } from '@/lib/validations/license';

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
        // Rate limit: 20 validations per minute per IP (reduced for security)
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`validate:${ip}`, 20, 60);
        if (!rateLimitResult.allowed) {
            console.warn(`[SECURITY] Rate limit exceeded for license validation from ${ip}`);
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: corsHeaders }
            );
        }

        const body = await request.json();

        const validation = licenseValidateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.message },
                { status: 400, headers: corsHeaders }
            );
        }

        const { licenseKey } = validation.data;

        // Check cache first (5 min TTL for valid licenses)
        const cached = await getCachedLicense(licenseKey);
        if (cached && cached.valid) {
            return NextResponse.json(cached, { headers: corsHeaders });
        }

        // Cache miss - query database
        const result = await licenseService.validate(licenseKey);

        // Cache valid licenses only
        if (result.valid) {
            await setCachedLicense(licenseKey, result, 300); // 5 min
        }

        if (!result.valid) {
            console.warn(`[SECURITY] Invalid license attempt from ${ip}: ${licenseKey.substring(0, 15)}...`);
            return NextResponse.json(result, { status: 401, headers: corsHeaders });
        }

        return NextResponse.json(result, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

