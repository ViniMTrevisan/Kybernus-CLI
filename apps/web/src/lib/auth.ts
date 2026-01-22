import jwt from 'jsonwebtoken';

const JWT_SECRET_RAW = process.env.JWT_SECRET;

if (!JWT_SECRET_RAW) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is required for security');
}

// TypeScript now knows this is definitely a string
const JWT_SECRET: string = JWT_SECRET_RAW;

export interface AdminTokenPayload {
    email: string;
    role: 'admin' | 'user'; // Extended to include user
    iat?: number;
    exp?: number;
}

export function signAdminToken(email: string): string {
    return jwt.sign(
        { email, role: 'admin' } as AdminTokenPayload,
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

export function signUserToken(email: string): string {
    return jwt.sign(
        { email, role: 'user' } as AdminTokenPayload,
        JWT_SECRET,
        { expiresIn: '7d' } // Users stay logged in longer
    );
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    } catch (error) {
        return null;
    }
}

export function verifyUserToken(token: string): AdminTokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    } catch (error) {
        return null;
    }
}

export function isAdmin(email: string): boolean {
    return email === process.env.ADMIN_EMAIL;
}
