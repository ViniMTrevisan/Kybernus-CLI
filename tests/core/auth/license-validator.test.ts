import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LicenseValidator } from '../../../src/core/auth/license-validator.js';

// Mock ConfigManager methods
const mockGetLicenseKey = vi.fn();
const mockGetMachineId = vi.fn();

vi.mock('../../../src/core/config/config-manager.js', () => {
    return {
        ConfigManager: class {
            getLicenseKey = mockGetLicenseKey;
            getMachineId = mockGetMachineId;
        },
    };
});

describe('LicenseValidator', () => {
    let validator: LicenseValidator;
    let fetchMock: any;

    beforeEach(() => {
        vi.clearAllMocks();
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        // Setup ConfigManager mock behavior
        mockGetMachineId.mockReturnValue('test-machine-id');

        // Re-instantiate validator to ensure it uses the mocked ConfigManager
        validator = new LicenseValidator();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should validate license successfully', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({
                valid: true,
                tier: 'pro',
                status: 'PRO_ACTIVE',
                message: 'Active',
            }),
        };
        fetchMock.mockResolvedValue(mockResponse);

        const result = await validator.validate('valid-key');

        expect(result.valid).toBe(true);
        expect(result.tier).toBe('PRO');
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/licenses/validate'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ licenseKey: 'valid-key', machineId: 'test-machine-id' }),
            })
        );
    });

    it('should handle validation failure from API', async () => {
        const mockResponse = {
            ok: false,
            json: async () => ({ error: 'License not found' }),
        };
        fetchMock.mockResolvedValue(mockResponse);

        const result = await validator.validate('invalid-key');

        expect(result.valid).toBe(false);
        expect(result.message).toBe('License not found');
    });

    it('should handle network error', async () => {
        fetchMock.mockRejectedValue(new Error('Network error'));

        const result = await validator.validate('any-key');

        expect(result.valid).toBe(false);
        expect(result.message).toContain('Connection error');
    });

    it('should consume credit successfully', async () => {
        const mockResponse = {
            json: async () => ({ authorized: true, usage: 1, limit: 3 }),
        };
        fetchMock.mockResolvedValue(mockResponse);

        const result = await validator.consumeCredit('key');
        expect(result.authorized).toBe(true);
        expect(result.usage).toBe(1);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/licenses/consume'),
            expect.objectContaining({ method: 'POST' })
        );
    });
});
