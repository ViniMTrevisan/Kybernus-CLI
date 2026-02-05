import jwt from 'jsonwebtoken';

/**
* JWT Token Generator - Infrastructure Provider
*/
export const jwtTokenGenerator = {
    generate(userId: string, email: string): string {
        return jwt.sign(
            { id: userId, email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
    },

    verify(token: string): { id: string; email: string } | null {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
                id: string;
                email: string;
            };
        } catch {
            return null;
        }
    },
};