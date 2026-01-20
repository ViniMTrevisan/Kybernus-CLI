import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export interface AdminTokenPayload {
    email: string;
    role: 'admin';
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

export function verifyAdminToken(token: string): AdminTokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    } catch (error) {
        return null;
    }
}

export function isAdmin(email: string): boolean {
    return email === process.env.ADMIN_EMAIL;
}
