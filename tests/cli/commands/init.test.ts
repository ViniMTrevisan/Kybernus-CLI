import { describe, it, expect, beforeEach, vi, afterEach, Mock } from 'vitest';
import { initCommand } from '../../../src/cli/commands/init.js';
import * as clack from '@clack/prompts';
import { ProjectGenerator } from '../../../src/core/generator/project.js';
import { ConfigManager } from '../../../src/core/config/config-manager.js';
import { LicenseValidator } from '../../../src/core/auth/license-validator.js';
import { AnalyticsClient } from '../../../src/cli/services/AnalyticsClient.js';

// Mock clack and Analytics
vi.mock('@clack/prompts', () => ({
    log: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
    note: vi.fn(),
    spinner: () => ({ start: vi.fn(), stop: vi.fn() }),
    outro: vi.fn(),
    intro: vi.fn(),
    group: vi.fn(),
    text: vi.fn(),
    select: vi.fn(),
    confirm: vi.fn(),
    password: vi.fn(),
    multiselect: vi.fn(),
    cancel: vi.fn(),
    isCancel: vi.fn(),
}));

// We'll spy on prototypes
describe('initCommand E2E Flow', () => {
    let mockGenerate: any;
    let mockGetLicenseKey: any;
    let mockGetLicenseExpiration: any;
    let mockValidate: any;
    let mockIsLicenseActive: any;
    let mockConsumeCredit: any;
    let mockTrack: any;

    beforeEach(() => {
        vi.restoreAllMocks(); // Clear previous spies

        // ConfigManager Spies
        mockGetLicenseKey = vi.spyOn(ConfigManager.prototype, 'getLicenseKey').mockReturnValue(undefined);
        mockGetLicenseExpiration = vi.spyOn(ConfigManager.prototype, 'getLicenseExpiration').mockReturnValue(undefined);
        vi.spyOn(ConfigManager.prototype, 'clearLicense').mockImplementation(() => { });

        // LicenseValidator Spies
        mockValidate = vi.spyOn(LicenseValidator.prototype, 'validate');
        mockIsLicenseActive = vi.spyOn(LicenseValidator.prototype, 'isLicenseActive').mockReturnValue(true);
        mockConsumeCredit = vi.spyOn(LicenseValidator.prototype, 'consumeCredit');

        // Generator Spy
        mockGenerate = vi.spyOn(ProjectGenerator.prototype, 'generate').mockImplementation(async () => { });

        // Analytics Spy
        mockTrack = vi.spyOn(AnalyticsClient.prototype, 'track').mockImplementation(async () => { });

        vi.spyOn(process, 'cwd').mockReturnValue('/tmp/test-cwd');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should generate a Free project if no license is present', async () => {
        mockGetLicenseKey.mockReturnValue(undefined);

        (clack.group as Mock).mockResolvedValue({
            projectName: 'free-proj',
            stack: 'nodejs-express',
            licenseTier: 'free',
            useAI: false
        });

        await initCommand({});

        expect(clack.group).toHaveBeenCalled();
        expect(mockGenerate).toHaveBeenCalled();
        expect(mockTrack).toHaveBeenCalledWith('project_generated', expect.objectContaining({ tier: 'free' }));
    });

    it('should generate a Pro project if license is valid', async () => {
        mockGetLicenseKey.mockReturnValue('valid-pro-key');
        mockValidate.mockResolvedValue({ valid: true, tier: 'PRO' });
        mockConsumeCredit.mockResolvedValue({ authorized: true, limit: 3, usage: 1, remaining: 2 });

        (clack.group as Mock).mockResolvedValue({
            projectName: 'pro-proj',
            stack: 'nestjs',
            licenseTier: 'pro',
            useAI: false
        });

        await initCommand({});

        expect(mockConsumeCredit).toHaveBeenCalled();
        expect(mockGenerate).toHaveBeenCalled();
    });

    it('should block generation if limit is reached', async () => {
        mockGetLicenseKey.mockReturnValue('trial-key');
        mockValidate.mockResolvedValue({ valid: true, tier: 'PRO' });
        mockConsumeCredit.mockResolvedValue({ authorized: false, message: 'Limit reached' });

        (clack.group as Mock).mockResolvedValue({
            projectName: 'pro-proj',
            stack: 'nestjs',
            licenseTier: 'pro'
        });

        await initCommand({});

        expect(clack.group).toHaveBeenCalled();
        expect(mockConsumeCredit).toHaveBeenCalled();
        expect(mockGenerate).not.toHaveBeenCalled();
    });
});
