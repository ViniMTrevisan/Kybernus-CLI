import { describe, it, expect, beforeAll } from 'vitest';
import { emailService } from '../src/lib/email';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ONLY run this test if explicitly requested, as it sends real emails
// Run with: npx vitest run apps/web/tests/email-real.test.ts
describe('REAL Transactional Email Sending', () => {
    const targetEmail = 'vinimtrevisan@gmail.com';

    it('sends Welcome Email to target address', async () => {
        if (!process.env.RESEND_API_KEY) {
            console.warn('Skipping real email test: RESEND_API_KEY not found');
            return;
        }

        console.log(`Sending real Welcome email to ${targetEmail}...`);
        const result = await emailService.sendWelcome(targetEmail, 'KYB-REAL-TEST-KEY');
        expect(result).toBe(true);
    }, 30000); // 30s timeout
});
