import { NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';
import { rateLimit } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Rate limit: 100 events per minute per IP
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`analytics:${ip}`, 100, 60);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

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
