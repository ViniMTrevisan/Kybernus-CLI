import { NextResponse } from 'next/server';
import { rateLimit, deviceRedis as redis } from '@/lib/redis';
import crypto from 'crypto';

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

/**
 * POST /api/auth/device/code
 * Generates a device code for CLI OAuth flow
 * Returns: deviceCode, userCode, verificationUrl, expiresIn
 */
export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Rate limit device code generation
        const rateLimitResult = await rateLimit(`device-code:${ip}`, 5, 60);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: corsHeaders }
            );
        }

        // Generate unique device code (UUID)
        const deviceCode = crypto.randomUUID();

        // Generate user-friendly code (8 chars, alphanumeric, easy to type)
        const userCode = generateUserCode();

        const expiresIn = 600; // 10 minutes
        const interval = 5; // Poll every 5 seconds

        // Store device code in Redis with pending status
        const deviceData = {
            userCode,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        await redis.set(
            `device:${deviceCode}`,
            JSON.stringify(deviceData),
            { ex: expiresIn }
        );

        // Also store reverse lookup (userCode -> deviceCode)
        await redis.set(
            `device-user:${userCode}`,
            deviceCode,
            { ex: expiresIn }
        );

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kybernus.vercel.app';
        const verificationUrl = `${baseUrl}/device`;

        return NextResponse.json({
            deviceCode,
            userCode,
            verificationUrl,
            expiresIn,
            interval,
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('[Device Auth] Code generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate device code' },
            { status: 500, headers: corsHeaders }
        );
    }
}

/**
 * Generates a user-friendly code like "ABCD-1234"
 */
function generateUserCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O to avoid confusion
    const nums = '23456789'; // Removed 0, 1 to avoid confusion

    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
        code += nums[Math.floor(Math.random() * nums.length)];
    }

    return code;
}
