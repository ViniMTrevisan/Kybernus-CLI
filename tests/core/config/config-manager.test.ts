import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager } from '../../../src/core/config/config-manager.js';

// Mock 'conf' module
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDelete = vi.fn();
const mockStore = {};

vi.mock('conf', () => {
    return {
        default: class {
            get = mockGet;
            set = mockSet;
            delete = mockDelete;
            store = mockStore;
        },
    };
});

describe('ConfigManager', () => {
    let configManager: ConfigManager;

    beforeEach(() => {
        vi.clearAllMocks();
        configManager = new ConfigManager();
    });

    it('should get license key', () => {
        mockGet.mockReturnValue('test-key');
        expect(configManager.getLicenseKey()).toBe('test-key');
        expect(mockGet).toHaveBeenCalledWith('licenseKey');
    });

    it('should set license key', () => {
        configManager.setLicenseKey('new-key');
        expect(mockSet).toHaveBeenCalledWith('licenseKey', 'new-key');
    });

    it('should get default license tier as FREE', () => {
        mockGet.mockImplementation((key, defaultValue) => defaultValue);
        expect(configManager.getLicenseTier()).toBe('FREE');
    });

    it('should generate machineId if missing', () => {
        mockGet.mockReturnValue(undefined);
        const id = configManager.getMachineId();
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
        expect(mockSet).toHaveBeenCalledWith('machineId', expect.any(String));
    });

    it('should reuse existing machineId', () => {
        mockGet.mockReturnValue('existing-id');
        const id = configManager.getMachineId();
        expect(id).toBe('existing-id');
        expect(mockSet).not.toHaveBeenCalledWith('machineId', expect.any(String));
    });

    it('should clear license data', () => {
        configManager.clearLicense();
        expect(mockDelete).toHaveBeenCalledWith('licenseKey');
        expect(mockDelete).toHaveBeenCalledWith('licenseTier');
        expect(mockDelete).toHaveBeenCalledWith('licenseExpiration');
        expect(mockDelete).toHaveBeenCalledWith('email');
        expect(mockSet).toHaveBeenCalledWith('licenseTier', 'FREE');
    });
});
