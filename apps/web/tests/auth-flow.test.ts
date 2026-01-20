import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import * as dotenv from 'dotenv';
import * as path from 'path';
import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';
import { LicenseService } from '../src/services/license.service';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Mock dependencies
vi.mock('@/lib/email', () => ({
    emailService: {
        sendWelcome: vi.fn(),
    }
}));

describe('Auth Security Flow', () => {
    const testEmail = `auth-secure-${Date.now()}@example.com`;
    const testPassword = 'secure-password-123';
    let userId: string;

    const licenseService = new LicenseService();

    afterAll(async () => {
        // Cleanup
        await prisma.user.delete({ where: { email: testEmail } }).catch(() => { });
    });

    it('should hash password on trial creation', async () => {
        const user = await licenseService.createTrialUser(testEmail, testPassword);
        userId = user.id;

        expect(user.password).toBeDefined();
        expect(user.password).not.toBe(testPassword); // Must not be plain text

        // Verify hash format (bcrypt starts with $2b$)
        expect(user.password?.startsWith('$2b$')).toBe(true);

        // Verify we can compare it
        const isValid = await bcrypt.compare(testPassword, user.password!);
        expect(isValid).toBe(true);
    });

    it('should NOT allow login with wrong password', async () => {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Simulate login check
        const isValid = await bcrypt.compare('wrong-password', user!.password!);
        expect(isValid).toBe(false);
    });

    it('should allow login with correct password', async () => {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Simulate login check
        const isValid = await bcrypt.compare(testPassword, user!.password!);
        expect(isValid).toBe(true);
    });
});
