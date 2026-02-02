import { NextResponse } from 'next/server';
import { getGoogleAuthUrl, generateStateToken } from '@/lib/oauth/google';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/google/url
 * Returns the Google OAuth authorization URL
 */
export async function GET() {
    try {
        // Generate CSRF protection state token
        const state = generateStateToken();

        // Store state in cookie for verification on callback
        const cookieStore = await cookies();
        cookieStore.set('oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 10, // 10 minutes
            path: '/',
        });

        const url = getGoogleAuthUrl(state);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('[OAuth] URL generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate OAuth URL' },
            { status: 500 }
        );
    }
}
