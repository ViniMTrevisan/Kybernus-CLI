import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { authCommand } from '../../../src/cli/commands/auth.js';
import * as generator from '../../../src/core/features/feature-generator.js';
import * as helpers from '../../../src/cli/utils/cli-helpers.js';
import * as clack from '@clack/prompts';

// Mock dependencies
vi.mock('../../../src/core/features/feature-generator.js');
vi.mock('../../../src/cli/utils/cli-helpers.js');
vi.mock('@clack/prompts', () => ({
    intro: vi.fn(),
    outro: vi.fn(),
    log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        step: vi.fn(),
    },
    select: vi.fn(),
    confirm: vi.fn(),
    spinner: () => ({
        start: vi.fn(),
        stop: vi.fn(),
    }),
    cancel: vi.fn(),
    isCancel: vi.fn(),
}));

describe('authCommand', () => {
    const triggerAction = async () => {
        const action = (authCommand as any)._actionHandler;
        await action.call(authCommand, []);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(process, 'cwd').mockReturnValue('/tmp/test-project');
        vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
    });

    it('should generate auth automatically if .kybernusrc.json is found', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue({
            projectName: 'my-project',
            stack: 'nodejs-express',
            architecture: 'mvc'
        });
        (clack.confirm as Mock).mockResolvedValue(true);
        (generator.generateFeature as Mock).mockResolvedValue({
            copiedFiles: ['file.ts'],
            installedDependencies: [],
            instructionsPath: 'AUTH.md'
        });

        await triggerAction();

        expect(helpers.readProjectConfig).toHaveBeenCalled();
        expect(clack.select).not.toHaveBeenCalled(); // No stack selection
        expect(generator.generateFeature).toHaveBeenCalledWith('auth', 'nodejs-express', '/tmp/test-project', 'mvc');
        expect(helpers.displayFeatureResult).toHaveBeenCalled();
    });

    it('should prompt for stack and architecture if .kybernusrc.json is missing', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue(null);
        (clack.select as Mock).mockResolvedValue('python-fastapi');
        (helpers.promptArchitecture as Mock).mockResolvedValue('clean');
        (clack.confirm as Mock).mockResolvedValue(true);
        (generator.generateFeature as Mock).mockResolvedValue({
            copiedFiles: ['file.py'],
            installedDependencies: [],
            instructionsPath: 'AUTH.md'
        });

        await triggerAction();

        expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('No .kybernusrc.json found'));
        expect(clack.select).toHaveBeenCalled(); // Should ask for stack
        expect(helpers.promptArchitecture).toHaveBeenCalled();
        expect(generator.generateFeature).toHaveBeenCalledWith('auth', 'python-fastapi', '/tmp/test-project', 'clean');
    });

    it('should exit if user cancels stack selection', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue(null);
        (clack.select as Mock).mockResolvedValue('cancel');

        // Mocking return value of isCancel which exitIfCancelled uses
        (clack.isCancel as Mock).mockReturnValue(true);

        (helpers.exitIfCancelled as Mock).mockImplementation((val) => {
            if (val === 'cancel') throw new Error('cancelled');
        });

        await expect(triggerAction())
            .rejects.toThrow('cancelled');
    });
});
