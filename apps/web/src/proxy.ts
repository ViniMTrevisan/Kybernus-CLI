import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET
);

export async function proxy(request: NextRequest) {
    // Only protect /admin routes - no logging to avoid edge invocations
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    try {
        await jose.jwtVerify(token, JWT_SECRET);
    } catch {
        const response = NextResponse.redirect(new URL('/admin-login', request.url));
        response.cookies.delete('admin-token');
        return response;
    }

    return NextResponse.next();
}

// CRITICAL: Only match admin routes to minimize edge invocations
export const config = {
    matcher: ['/admin/:path*'],
};

export default proxy;
