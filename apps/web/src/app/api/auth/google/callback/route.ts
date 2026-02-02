import { NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleUserInfo } from '@/lib/oauth/google';
import { licenseService } from '@/services/license.service';
import { signUserToken } from '@/lib/auth';
import { emailService } from '@/lib/email';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/google/callback
 * Handles the OAuth callback from Google
 */
export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Rate limit OAuth callbacks
        const rateLimitResult = await rateLimit(`oauth:${ip}`, 10, 60);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many OAuth attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { code, state } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Authorization code is required' },
                { status: 400 }
            );
        }

        // Verify CSRF state token
        const cookieStore = await cookies();
        const storedState = cookieStore.get('oauth_state')?.value;

        if (!state || state !== storedState) {
            console.warn(`[SECURITY] OAuth state mismatch from ${ip}`);
            return NextResponse.json(
                { error: 'Invalid state parameter. Please try again.' },
                { status: 400 }
            );
        }

        // Clear the state cookie
        cookieStore.delete('oauth_state');

        // Exchange code for tokens
        const tokens = await getGoogleTokens(code);

        // Fetch user info from Google
        const googleUser = await getGoogleUserInfo(tokens.access_token);

        if (!googleUser.email) {
            return NextResponse.json(
                { error: 'Email not provided by Google' },
                { status: 400 }
            );
        }

        // Check if user exists by googleId
        let user = await prisma.user.findUnique({
            where: { googleId: googleUser.id },
        });

        let isNewUser = false;
        let needsLinking = false;
        let existingUserByEmail = null;

        if (!user) {
            // Check if user exists by email (for account linking)
            existingUserByEmail = await prisma.user.findUnique({
                where: { email: googleUser.email },
            });

            if (existingUserByEmail) {
                // User exists with email but no googleId - needs linking confirmation
                if (!existingUserByEmail.googleId) {
                    needsLinking = true;
                }
            }
        }

        if (needsLinking && existingUserByEmail) {
            // Return response indicating account linking is needed
            return NextResponse.json({
                needsLinking: true,
                email: googleUser.email,
                googleId: googleUser.id,
                message: 'An account with this email already exists. Would you like to link your Google account?'
            }, { status: 200 });
        }

        if (!user && !existingUserByEmail) {
            // Create new user with Google OAuth
            isNewUser = true;
            const licenseKey = licenseService.generateLicenseKey('trial');

            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
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
        } else if (user) {
            // Update last login and profile picture
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    lastLoginAt: new Date(),
                    profilePicture: googleUser.picture,
                },
            });
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Failed to create or find user' },
                { status: 500 }
            );
        }

        // Generate JWT token
        const token = signUserToken(user.email);

        // Response with minimal user data (sensitive data stored in HTTP-only cookie)
        const response = NextResponse.json({
            success: true,
            isNewUser,
            user: {
                email: user.email,
                tier: user.tier,
                status: user.status,
            },
        });

        // Set HTTP-only cookie
        response.cookies.set('user-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('[OAuth] Callback error:', error);
        return NextResponse.json(
            { error: 'OAuth authentication failed' },
            { status: 500 }
        );
    }
}
