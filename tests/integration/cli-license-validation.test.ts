import { describe, it, expect } from 'vitest';
import { LicenseValidator } from '../../dist/core/auth/license-validator.js';

/**
 * REAL E2E TEST: CLI License Validation against Live API
 * 
 * This test verifies that the CLI can validate real license keys
 * against the running API server (http://localhost:3010)
 */
describe('CLI License Validation E2E (Live API)', () => {
    const validator = new LicenseValidator();

    it('should validate a real TRIAL license key', async () => {
        // Real license key created for testing
        const realLicenseKey = 'KYB-TRIAL-7259-83B6-73D4';

        const result = await validator.validate(realLicenseKey);

        expect(result.valid).toBe(true);
        expect(result.status).toBe('TRIAL');
        expect(result.tier).toBeDefined();
        expect(result.usage).toBe(0);
        expect(result.limit).toBe(3);
    });

    it('should reject an invalid license key', async () => {
        const invalidKey = 'KYB-FAKE-XXXX-YYYY-ZZZZ';

        const result = await validator.validate(invalidKey);

        expect(result.valid).toBe(false);
    });

    it('should consume a credit and update usage', async () => {
        const realLicenseKey = 'KYB-TRIAL-7259-83B6-73D4';

        const result = await validator.consumeCredit(realLicenseKey);

        expect(result.authorized).toBe(true);
        expect(result.usage).toBe(1); // First project consumed
        expect(result.remaining).toBe(2); // 2 remaining
        expect(result.limit).toBe(3);
    });
});
