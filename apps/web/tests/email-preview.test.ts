import { describe, it, expect, vi, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock Resend before import
const mockSend = vi.fn();

vi.mock('resend', () => {
    return {
        Resend: class {
            constructor(apiKey: string) { }
            emails = {
                send: mockSend
            }
        }
    }
});

import { emailService } from '../src/lib/email';

describe('Transactional Email Previews', () => {
    const previewDir = path.join(__dirname, '../email-previews');

    beforeAll(() => {
        if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
        }
        process.env.RESEND_API_KEY = 're_test_key_123';
        process.env.EMAIL_FROM = 'Kybernus <noreply@kybernus.com>';
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3010';
    });

    // Helper to save preview
    const savePreview = (name: string, html: string) => {
        const filePath = path.join(previewDir, `${name}.html`);
        fs.writeFileSync(filePath, html);
        console.log(`Saved preview: ${filePath}`);
    };

    it('generates License Key email', async () => {
        mockSend.mockResolvedValue({ id: 'msg_123' });
        await emailService.sendLicenseKey('user@test.com', 'KYB-PRO-TEST-KEY-123');

        expect(mockSend).toHaveBeenCalled();
        const callArgs = mockSend.mock.calls[0][0];
        savePreview('license-key', callArgs.html);
        mockSend.mockClear();
    });

    it('generates Upgrade Confirmation email', async () => {
        mockSend.mockResolvedValue({ id: 'msg_123' });
        await emailService.sendUpgradeConfirmation('user@test.com', 'KYB-PRO-UPGRADE-KEY');

        const callArgs = mockSend.mock.calls[0][0];
        savePreview('upgrade-confirmation', callArgs.html);
        mockSend.mockClear();
    });

    it('generates Welcome email', async () => {
        mockSend.mockResolvedValue({ id: 'msg_123' });
        await emailService.sendWelcome('newuser@test.com', 'KYB-TRIAL-WELCOME-KEY');

        const callArgs = mockSend.mock.calls[0][0];
        savePreview('welcome', callArgs.html);
        mockSend.mockClear();
    });

    it('generates Password Reset email', async () => {
        mockSend.mockResolvedValue({ id: 'msg_123' });
        await emailService.sendPasswordReset('forgot@test.com', 'reset-token-123456');

        const callArgs = mockSend.mock.calls[0][0];
        savePreview('password-reset', callArgs.html);
        mockSend.mockClear();
    });

    it('generates Trial Warning email', async () => {
        mockSend.mockResolvedValue({ id: 'msg_123' });
        await emailService.sendTrialWarning('warning@test.com', 2, 3);

        const callArgs = mockSend.mock.calls[0][0];
        savePreview('trial-warning', callArgs.html);
        mockSend.mockClear();
    });
});
