import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Strong password schema (same as in validations/auth.ts)
const strongPasswordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

describe('Password Validation', () => {
    describe('Weak Passwords (Should Fail)', () => {
        const weakPasswords = [
            { password: 'short', reason: 'less than 12 characters' },
            { password: 'alllowercase', reason: 'no uppercase' },
            { password: 'ALLUPPERCASE', reason: 'no lowercase' },
            { password: 'NoNumbersHere!', reason: 'no numbers' },
            { password: 'NoSpecial123', reason: 'no special characters' },
            { password: 'onlylowerandnumber1', reason: 'no uppercase or special' },
            { password: 'ONLYUPPERANDNUMBER1', reason: 'no lowercase or special' },
        ];

        weakPasswords.forEach(({ password, reason }) => {
            it(`should reject password: "${password}" (${reason})`, () => {
                const result = strongPasswordSchema.safeParse(password);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('Strong Passwords (Should Pass)', () => {
        const strongPasswords = [
            'StrongP@ss123',
            'MySecure#Pass456',
            'Complex!Pass789XYZ',
            'Tr0ng&Password',
            '12CharsWith@UpperLower123',
            'P@ssw0rd!Secure',
            'ValidPassw0rd#2024',
        ];

        strongPasswords.forEach((password) => {
            it(`should accept strong password: "${password}"`, () => {
                const result = strongPasswordSchema.safeParse(password);
                expect(result.success).toBe(true);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should reject exactly 7 characters', () => {
            const result = strongPasswordSchema.safeParse('ShrtP@s');
            expect(result.success).toBe(false);
        });

        it('should accept exactly 8 characters', () => {
            const result = strongPasswordSchema.safeParse('Valid@P8');
            expect(result.success).toBe(true);
        });

        it('should accept very long passwords', () => {
            const longPassword = 'VeryLongP@ssword123WithManyCharacters!@#$%^&*()';
            const result = strongPasswordSchema.safeParse(longPassword);
            expect(result.success).toBe(true);
        });

        it('should reject empty string', () => {
            const result = strongPasswordSchema.safeParse('');
            expect(result.success).toBe(false);
        });

        it('should accept various special characters', () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const password = `TestPass123${specialChars.charAt(0)}`; // Ensure it has uppercase
            const result = strongPasswordSchema.safeParse(password);
            expect(result.success).toBe(true);
        });
    });

    describe('Specific Requirements', () => {
        it('should enforce minimum 8 characters', () => {
            const result = strongPasswordSchema.safeParse('Pass@1');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('8 characters')
                )).toBe(true);
            }
        });

        it('should enforce uppercase letter requirement', () => {
            const result = strongPasswordSchema.safeParse('password@123');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('uppercase')
                )).toBe(true);
            }
        });

        it('should enforce lowercase letter requirement', () => {
            const result = strongPasswordSchema.safeParse('PASSWORD@123');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('lowercase')
                )).toBe(true);
            }
        });

        it('should enforce number requirement', () => {
            const result = strongPasswordSchema.safeParse('Password@NoNum');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('number')
                )).toBe(true);
            }
        });

        it('should enforce special character requirement', () => {
            const result = strongPasswordSchema.safeParse('Password123NoSpec');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('special')
                )).toBe(true);
            }
        });
    });
});
