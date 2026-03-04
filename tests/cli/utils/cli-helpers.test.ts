import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import fs from 'fs-extra';
import { readProjectConfig, exitIfCancelled } from '../../../src/cli/utils/cli-helpers.js';
import * as clack from '@clack/prompts';

// Mock fs-extra
vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn(),
        readJson: vi.fn(),
        existsSync: vi.fn(),
        readFile: vi.fn(),
    }
}));

// Mock clack prompts
vi.mock('@clack/prompts', () => ({
    isCancel: vi.fn((val) => val === 'cancel'),
    cancel: vi.fn(),
    log: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
    outro: vi.fn(),
    select: vi.fn(),
}));

describe('cli-helpers', () => {
    const projectRoot = '/tmp/fake-project';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit called'); });
    });

    describe('readProjectConfig', () => {
        it('should return config if .kybernusrc.json exists', async () => {
            const mockConfig = { projectName: 'test', stack: 'nextjs', architecture: 'mvc' };
            (fs.existsSync as Mock).mockReturnValue(true);
            (fs.readFile as Mock).mockResolvedValue(JSON.stringify(mockConfig));

            const config = await readProjectConfig(projectRoot);
            expect(config).toEqual(mockConfig);
        });

        it('should return null if file missing and requireExistence is false', async () => {
            (fs.existsSync as Mock).mockReturnValue(false);
            const config = await readProjectConfig(projectRoot, { requireExistence: false });
            expect(config).toBeNull();
        });

        it('should exit and log error if file missing and requireExistence is true', async () => {
            (fs.existsSync as Mock).mockReturnValue(false);

            await expect(readProjectConfig(projectRoot, { requireExistence: true }))
                .rejects.toThrow('process.exit called');

            expect(clack.log.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
        });
    });

    describe('exitIfCancelled', () => {
        it('should do nothing if value is not a cancel', () => {
            expect(() => exitIfCancelled('some value')).not.toThrow();
            expect(clack.cancel).not.toHaveBeenCalled();
        });

        it('should exit if value is a cancel', () => {
            expect(() => exitIfCancelled('cancel'))
                .toThrow('process.exit called');
            expect(clack.cancel).toHaveBeenCalledWith('Cancelled.');
        });
    });
});
