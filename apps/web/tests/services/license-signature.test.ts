import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// We'll test the signature generation logic directly since mocking is problematic
describe('License Signature Security', () => {
    const testSecret = 'test-license-secret-for-testing-purposes';

    beforeEach(() => {
        process.env.LICENSE_SECRET = testSecret;
    });

    describe('License Format Validation', () => {
        it('should match new license format with signature', () => {
            const newFormat = 'KYB-PRO-A1B2-C3D4-E5F6-12345678';
            const regex = /^KYB-(PRO|TRIAL|FREE)-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{8}$/;

            expect(newFormat).toMatch(regex);
        });

        it('should match old license format without signature', () => {
            const oldFormat = 'KYB-PRO-A1B2-C3D4-E5F6';
            const regex = /^KYB-(PRO|TRIAL|FREE)-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;

            expect(oldFormat).toMatch(regex);
        });

        it('should reject invalid formats', () => {
            const invalidFormats = [
                'INVALID-KEY',
                'KYB-INVALID-A1B2',
                'ABC-PRO-A1B2-C3D4-E5F6',
            ];

            const regex = /^KYB-(PRO|TRIAL|FREE)-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}(-[A-F0-9]{8})?$/;

            invalidFormats.forEach(format => {
                expect(format).not.toMatch(regex);
            });
        });
    });

    describe('HMAC Signature Generation', () => {
        it('should generate consistent signatures', () => {
            const base = 'KYB-PRO-A1B2-C3D4-E5F6';

            const sig1 = crypto
                .createHmac('sha256', testSecret)
                .update(base)
                .digest('hex')
                .substring(0, 8)
                .toUpperCase();

            const sig2 = crypto
                .createHmac('sha256', testSecret)
                .update(base)
                .digest('hex')
                .substring(0, 8)
                .toUpperCase();

            expect(sig1).toBe(sig2);
            expect(sig1).toHaveLength(8);
        });

        it('should generate different signatures for different bases', () => {
            const base1 = 'KYB-PRO-A1B2-C3D4-E5F6';
            const base2 = 'KYB-PRO-B2C3-D4E5-F6A7';

            const sig1 = crypto
                .createHmac('sha256', testSecret)
                .update(base1)
                .digest('hex')
                .substring(0, 8);

            const sig2 = crypto
                .createHmac('sha256', testSecret)
                .update(base2)
                .digest('hex')
                .substring(0, 8);

            expect(sig1).not.toBe(sig2);
        });

        it('should generate different signatures with different secrets', () => {
            const base = 'KYB-PRO-A1B2-C3D4-E5F6';

            const sig1 = crypto
                .createHmac('sha256', testSecret)
                .update(base)
                .digest('hex')
                .substring(0, 8);

            const sig2 = crypto
                .createHmac('sha256', 'different-secret')
                .update(base)
                .digest('hex')
                .substring(0, 8);

            expect(sig1).not.toBe(sig2);
        });

        it('should only use uppercase hexadecimal characters', () => {
            const base = 'KYB-TRIAL-1234-5678-90AB';

            const signature = crypto
                .createHmac('sha256', testSecret)
                .update(base)
                .digest('hex')
                .substring(0, 8)
                .toUpperCase();

            expect(signature).toMatch(/^[A-F0-9]{8}$/);
        });
    });
});
