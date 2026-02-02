/**
 * Google OAuth Service
 * Handles OAuth flow with Google for authentication
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

interface GoogleTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    id_token?: string;
}

interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
}

function getConfig() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3010/auth/callback';

    if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }

    return { clientId, clientSecret, redirectUri };
}

/**
 * Generate Google OAuth authorization URL
 * @param state - CSRF protection token (should be stored in session/cookie)
 */
export function getGoogleAuthUrl(state: string): string {
    const { clientId, redirectUri } = getConfig();

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
        state: state,
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getGoogleTokens(code: string): Promise<GoogleTokenResponse> {
    const { clientId, clientSecret, redirectUri } = getConfig();

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('[OAuth] Token exchange failed:', error);
        throw new Error('Failed to exchange authorization code for tokens');
    }

    return response.json();
}

/**
 * Fetch user profile from Google
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('[OAuth] User info fetch failed:', error);
        throw new Error('Failed to fetch Google user info');
    }

    return response.json();
}

/**
 * Generate a random state token for CSRF protection
 */
export function generateStateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
