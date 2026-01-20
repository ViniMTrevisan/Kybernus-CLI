import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { getCachedLicense, setCachedLicense } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { licenseKey } = await request.json();

        if (!licenseKey) {
            return NextResponse.json(
                { error: 'License key is required' },
                { status: 400 }
            );
        }

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

