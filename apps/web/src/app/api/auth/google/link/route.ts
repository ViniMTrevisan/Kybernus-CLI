import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signUserToken } from '@/lib/auth';
import { rateLimit } from '@/lib/redis';
import { cookies } from 'next/headers';
import { getGoogleTokens, getGoogleUserInfo } from '@/lib/oauth/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/google/link
 * Links a Google account to an existing email/password user
 * 
 * SECURITY: This endpoint now requires the Google authorization code,
 * NOT just the googleId. This prevents attackers from linking arbitrary
 * Google accounts to existing users.
 */
export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Strict rate limiting (5 attempts per minute per IP)
        const rateLimitResult = await rateLimit(`oauth-link:${ip}`, 5, 60);
        if (!rateLimitResult.allowed) {
            console.warn(`[SECURITY] Rate limit exceeded for OAuth link from ${ip}`);
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { email, code, state } = body;

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and authorization code are required' },
                { status: 400 }
            );
        }

        // Verify CSRF state token
        const cookieStore = await cookies();
        const storedState = cookieStore.get('oauth_state')?.value;

        if (!state || state !== storedState) {
            console.warn(`[SECURITY] OAuth state mismatch during link from ${ip}`);
            return NextResponse.json(
                { error: 'Invalid state parameter. Please try again.' },
                { status: 400 }
            );
        }

        // Clear the state cookie
        cookieStore.delete('oauth_state');

        // Exchange code for tokens to verify we actually own this Google account
        const tokens = await getGoogleTokens(code);
        const googleUser = await getGoogleUserInfo(tokens.access_token);

        if (!googleUser.email || !googleUser.id) {
            return NextResponse.json(
                { error: 'Failed to verify Google account' },
                { status: 400 }
            );
        }

        // Verify the email matches the requested link email
        if (googleUser.email.toLowerCase() !== email.toLowerCase()) {
            console.warn(`[SECURITY] Email mismatch during link: requested ${email}, got ${googleUser.email}`);
            return NextResponse.json(
                { error: 'Google account email does not match. Use your account email.' },
                { status: 400 }
            );
        }

        // Check if this Google ID is already linked to another account
        const existingGoogleUser = await prisma.user.findUnique({
            where: { googleId: googleUser.id },
        });

        if (existingGoogleUser) {
            return NextResponse.json(
                { error: 'This Google account is already linked to another user' },
                { status: 400 }
            );
        }

        // Find existing user by email
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (existingUser.googleId) {
            return NextResponse.json(
                { error: 'Account already linked to a Google account' },
                { status: 400 }
            );
        }

        // Link Google account to existing user
        const updatedUser = await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: {
                googleId: googleUser.id,
                oauthProvider: 'google',
                profilePicture: googleUser.picture || existingUser.profilePicture,
                lastLoginAt: new Date(),
            },
        });

        console.log(`[OAuth] Successfully linked Google account for ${email}`);

        // Generate JWT token
        const token = signUserToken(updatedUser.email);

        const response = NextResponse.json({
            success: true,
            message: 'Google account linked successfully',
            user: {
                email: updatedUser.email,
                tier: updatedUser.tier,
                status: updatedUser.status,
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
        console.error('[OAuth] Link error:', error);
        return NextResponse.json(
            { error: 'Failed to link Google account' },
            { status: 500 }
        );
    }
}
