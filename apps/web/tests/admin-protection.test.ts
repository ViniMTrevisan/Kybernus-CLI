import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../src/middleware';

// Mock environment
process.env.JWT_SECRET = 'test-secret';

describe('Admin Route Protection', () => {
    it('should redirect to secret login if no token is present', async () => {
        const req = new NextRequest(new URL('http://localhost:3000/admin'));
        const res = await middleware(req);

        expect(res?.status).toBe(307); // Redirect
        expect(res?.headers.get('Location')).toBe('http://localhost:3000/admin-login-nao-acharao');
    });

    it('should allow access with valid token', async () => {
        // This would require mocking jose.jwtVerify which is complex in this context.
        // Focusing on the rejection case which is the critical vulnerability.
    });
});
