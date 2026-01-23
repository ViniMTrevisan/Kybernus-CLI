import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET
);

export async function proxy(request: NextRequest) {
    console.log('[PROXY] Request to:', request.nextUrl.pathname);

    // Only protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        console.log('[PROXY] Admin route detected, checking token...');
        const token = request.cookies.get('admin-token')?.value;
        console.log('[PROXY] Token present:', !!token);

        if (!token) {
            return NextResponse.redirect(new URL('/admin-login', request.url));
        }

        try {
            // Verify JWT using jose (Edge-compatible)
            await jose.jwtVerify(token, JWT_SECRET);
        } catch (error) {
            // Clear invalid cookie and redirect
            const response = NextResponse.redirect(new URL('/admin-login', request.url));
            response.cookies.delete('admin-token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};

export default proxy;
