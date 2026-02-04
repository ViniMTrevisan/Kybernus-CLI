import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager } from '../../../src/core/config/config-manager.js';

// Mock 'conf' module
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDelete = vi.fn();
const mockClear = vi.fn();
const mockStore = {};

vi.mock('conf', () => {
    return {
        default: class {
            get = mockGet;
            set = mockSet;
            delete = mockDelete;
            clear = mockClear;
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

    it('should default analytics to enabled', () => {
        // Mock get to return the default value passed to it
        mockGet.mockImplementation((key, defaultValue) => defaultValue);
        expect(configManager.isAnalyticsEnabled()).toBe(true);
        expect(mockGet).toHaveBeenCalledWith('analyticsEnabled', true);
    });

    it('should set analytics enabled status', () => {
        configManager.setAnalyticsEnabled(false);
        expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', false);
    });

    it('should get analytics enabled status', () => {
        mockGet.mockReturnValue(false);
        expect(configManager.isAnalyticsEnabled()).toBe(false);
    });

    it('should clear config', () => {
        configManager.clear();
        expect(mockClear).toHaveBeenCalled();
    });
});
