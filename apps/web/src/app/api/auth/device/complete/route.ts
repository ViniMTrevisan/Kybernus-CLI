import { NextResponse } from 'next/server';
import { deviceRedis as redis, rateLimit } from '@/lib/redis';
import { getGoogleTokens, getGoogleUserInfo } from '@/lib/oauth/google';
import { licenseService } from '@/services/license.service';
import { emailService } from '@/lib/email';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/device/complete
 * Called from the /device page after user completes Google OAuth
 * Links the device code to the authenticated user
 * 
 * SECURITY:
 * - Rate limited per IP
 * - User code is verified against Redis
 * - CSRF state is verified from cookie
 * - Google code is exchanged server-side (not trusted from client)
 */
export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Rate limit to prevent brute force on user codes
        const rateLimitResult = await rateLimit(`device-complete:${ip}`, 10, 60);
        if (!rateLimitResult.allowed) {
            console.warn(`[SECURITY] Rate limit exceeded for device complete from ${ip}`);
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { userCode, googleCode, state } = body;

        if (!userCode || !googleCode) {
            return NextResponse.json(
                { error: 'User code and Google authorization code are required' },
                { status: 400 }
            );
        }

        // Verify CSRF state token
        const cookieStore = await cookies();
        const storedState = cookieStore.get('oauth_state')?.value;

        if (!state || state !== storedState) {
            console.warn(`[SECURITY] OAuth state mismatch during device complete from ${ip}`);
            return NextResponse.json(
                { error: 'Invalid state parameter. Please try again.' },
                { status: 400 }
            );
        }

        // Clear the state cookie
        cookieStore.delete('oauth_state');

        // Normalize and validate user code format
        const normalizedUserCode = userCode.toUpperCase().trim();
        if (!/^[A-Z]{4}-[0-9]{4}$/.test(normalizedUserCode)) {
            return NextResponse.json(
                { error: 'Invalid code format' },
                { status: 400 }
            );
        }

        // Look up device code from user code
        const deviceCode = await redis.get(`device-user:${normalizedUserCode}`);

        if (!deviceCode) {
            // Add delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.warn(`[SECURITY] Invalid user code attempt from ${ip}: ${normalizedUserCode}`);
            return NextResponse.json(
                { error: 'Invalid or expired code. Please try again.' },
                { status: 400 }
            );
        }

        // Get device data
        const deviceDataRaw = await redis.get(`device:${deviceCode}`);
        if (!deviceDataRaw) {
            return NextResponse.json(
                { error: 'Device session expired. Please restart the CLI authentication.' },
                { status: 400 }
            );
        }

        // Parse and validate device data
        let deviceData: any;
        try {
            deviceData = JSON.parse(deviceDataRaw as string);
        } catch {
            return NextResponse.json(
                { error: 'Invalid device session' },
                { status: 400 }
            );
        }

        // Check if already completed (prevent replay attacks)
        if (deviceData.status === 'complete') {
            return NextResponse.json(
                { error: 'This code has already been used' },
                { status: 400 }
            );
        }

        // Exchange Google code for tokens (verify we actually own this account)
        const tokens = await getGoogleTokens(googleCode);
        const googleUser = await getGoogleUserInfo(tokens.access_token);

        if (!googleUser.email || !googleUser.id) {
            return NextResponse.json(
                { error: 'Failed to verify Google account' },
                { status: 400 }
            );
        }

        // Check if user exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: googleUser.id },
                    { email: googleUser.email.toLowerCase() },
                ],
            },
        });

        let isNewUser = false;

        if (!user) {
            // Create new user
            isNewUser = true;
            const licenseKey = licenseService.generateLicenseKey('trial');

            user = await prisma.user.create({
                data: {
                    email: googleUser.email.toLowerCase(),
                    googleId: googleUser.id,
                    oauthProvider: 'google',
                    profilePicture: googleUser.picture,
                    licenseKey,
                    tier: 'FREE',
                    status: 'TRIAL',
                    projectLimit: 3,
                },
            });

            // Send welcome email
            await emailService.sendWelcome(googleUser.email, licenseKey);
            console.log(`[OAuth] New user created via device flow: ${googleUser.email}`);
        } else if (!user.googleId) {
            // Link Google account to existing user
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: googleUser.id,
                    oauthProvider: 'google',
                    profilePicture: googleUser.picture,
                    lastLoginAt: new Date(),
                },
            });
            console.log(`[OAuth] Google account linked via device flow: ${user.email}`);
        } else {
            // Just update last login
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginAt: new Date(),
                },
            });
            console.log(`[OAuth] Existing user authenticated via device flow: ${user.email}`);
        }

        // Update device data with user info
        deviceData.status = 'complete';
        deviceData.email = user.email;
        deviceData.licenseKey = user.licenseKey;
        deviceData.tier = user.tier;
        deviceData.completedAt = new Date().toISOString();

        // Store updated data (with short TTL since CLI will poll soon)
        await redis.set(
            `device:${deviceCode}`,
            JSON.stringify(deviceData),
            { ex: 300 } // 5 minutes for CLI to pick up
        );

        // Delete the user code mapping to prevent reuse
        await redis.del(`device-user:${normalizedUserCode}`);

        return NextResponse.json({
            success: true,
            isNewUser,
            message: 'Authentication successful! You can close this window and return to your terminal.',
        });

    } catch (error: any) {
        console.error('[Device Auth] Complete error:', error);
        return NextResponse.json(
            { error: 'Authentication failed. Please try again.' },
            { status: 500 }
        );
    }
}
