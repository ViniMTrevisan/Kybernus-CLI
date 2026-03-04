import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { addCommand } from '../../../src/cli/commands/add.js';
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
    },
    select: vi.fn(),
    confirm: vi.fn(),
    spinner: () => ({
        start: vi.fn(),
        stop: vi.fn(),
    }),
}));

describe('addCommand', () => {
    const triggerAction = async (featureArg?: string) => {
        const action = (addCommand as any)._actionHandler;
        // Commander's _actionHandler (the wrapper) expects an array of arguments
        await action.call(addCommand, featureArg ? [featureArg] : [undefined]);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(process, 'cwd').mockReturnValue('/tmp/test-project');
        vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });

        (generator.getSupportedFeatures as Mock).mockReturnValue(['swagger', 'redis']);
    });

    it('should add a feature if passed as an argument', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue({
            projectName: 'my-proj',
            stack: 'nodejs-express',
            architecture: 'mvc'
        });
        (generator.generateFeature as Mock).mockResolvedValue({ copiedFiles: [], installedDependencies: [] });

        await triggerAction('swagger');

        expect(generator.generateFeature).toHaveBeenCalledWith('swagger', 'nodejs-express', '/tmp/test-project', 'mvc');
    });

    it('should prompt for feature if not passed as an argument', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue({
            projectName: 'my-proj',
            stack: 'nodejs-express',
            architecture: 'mvc'
        });
        (clack.select as Mock).mockResolvedValue('redis');
        (generator.generateFeature as Mock).mockResolvedValue({ copiedFiles: [], installedDependencies: [] });

        await triggerAction();

        expect(clack.select).toHaveBeenCalled();
        expect(generator.generateFeature).toHaveBeenCalledWith('redis', 'nodejs-express', '/tmp/test-project', 'mvc');
    });

    it('should work without .kybernusrc.json (standalone)', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue(null);
        (clack.select as Mock).mockResolvedValueOnce('nestjs'); // Stack
        (helpers.promptArchitecture as Mock).mockResolvedValue('clean');
        (generator.getSupportedFeatures as Mock).mockReturnValue(['auth']);
        (clack.select as Mock).mockResolvedValueOnce('auth'); // Feature
        (generator.generateFeature as Mock).mockResolvedValue({ copiedFiles: [], installedDependencies: [] });

        await triggerAction();

        expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('No .kybernusrc.json found'));
        expect(generator.generateFeature).toHaveBeenCalledWith('auth', 'nestjs', '/tmp/test-project', 'clean');
    });
});
