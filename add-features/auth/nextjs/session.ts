import { cookies } from 'next/headers';
import { verifyToken, JwtPayload } from './jwt';

/**
 * Get the current user from the session cookie.
 * This can only be called from Server Components, Server Actions, or API Routes.
 */
export async function getSession(): Promise<JwtPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);
}

/**
 * Define your cookie configuration to be used during login/logout
 */
export const sessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days (must match your JWT expiry conceptually)
};
