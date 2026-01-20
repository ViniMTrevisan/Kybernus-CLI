import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';

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
