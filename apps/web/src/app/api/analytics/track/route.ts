import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { licenseKey, event, tier, stack, architecture, command, metadata } = body;

        if (!event) {
            return NextResponse.json(
                { error: 'Event name is required' },
                { status: 400 }
            );
        }

        // Get client info
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await analyticsService.track({
            licenseKey,
            event,
            tier,
            stack,
            architecture,
            command,
            metadata,
            ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress,
            userAgent,
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Analytics track error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
