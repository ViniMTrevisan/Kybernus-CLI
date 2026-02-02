import { NextResponse } from 'next/server';
import { rateLimit, deviceRedis as redis } from '@/lib/redis';

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

interface DeviceData {
    userCode: string;
    status: 'pending' | 'complete';
    createdAt: string;
    email?: string;
    licenseKey?: string;
    tier?: string;
}

/**
 * POST /api/auth/device/poll
 * CLI polls this endpoint to check if user completed OAuth
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { deviceCode } = body;

        if (!deviceCode) {
            return NextResponse.json(
                { error: 'Device code is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Rate limit polling (generous limit since CLI polls frequently)
        const rateLimitResult = await rateLimit(`device-poll:${deviceCode}`, 12, 60);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'slow_down', message: 'Polling too frequently' },
                { status: 429, headers: corsHeaders }
            );
        }

        // Get device data from Redis
        const deviceDataRaw = await redis.get(`device:${deviceCode}`);

        if (!deviceDataRaw) {
            return NextResponse.json(
                { error: 'expired_token', message: 'Device code expired or invalid' },
                { status: 400, headers: corsHeaders }
            );
        }

        const deviceData: DeviceData = JSON.parse(deviceDataRaw as string);

        if (deviceData.status === 'pending') {
            return NextResponse.json({
                status: 'pending'
            }, { headers: corsHeaders });
        }

        if (deviceData.status === 'complete') {
            await redis.del(`device:${deviceCode}`)
            await redis.del(`device-user:${deviceData.userCode}`);

            return NextResponse.json({
                status: 'complete',
                email: deviceData.email,
                licenseKey: deviceData.licenseKey,
                tier: deviceData.tier,
            }, { headers: corsHeaders });
        }
    } catch (error: any) {
        console.error('[Device Auth] Poll Error:', error)
        return NextResponse.json (
            { error: 'Failed to check device status '}, 
            { status: 500, headers: corsHeaders }
        );
    }
}
