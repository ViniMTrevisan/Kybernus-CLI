import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Define the routes that require authentication
const protectedRoutes = ['/dashboard', '/api/protected'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if it's a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute || isAuthRoute) {
        const token = request.cookies.get('token')?.value;
        const payload = token ? verifyToken(token) : null;

        if (isProtectedRoute && !payload) {
            // Redirect to login if trying to access a protected route without a valid token
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (isAuthRoute && payload) {
            // Redirect to dashboard if logged in and trying to access login/register
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

// Ensure the middleware runs on relevant paths
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
