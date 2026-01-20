import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

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
