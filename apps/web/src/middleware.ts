import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'default-secret-change-in-production'
);

export async function middleware(request: NextRequest) {
    // Only protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const token = request.cookies.get('admin-token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin-login-nao-acharao', request.url));
        }

        try {
            // Verify JWT using jose (Edge-compatible)
            await jose.jwtVerify(token, JWT_SECRET);
        } catch (error) {
            // Clear invalid cookie and redirect
            const response = NextResponse.redirect(new URL('/admin-login-nao-acharao', request.url));
            response.cookies.delete('admin-token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
