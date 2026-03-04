import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { deployCommand } from '../../../src/cli/commands/deploy.js';
import * as generator from '../../../src/core/deploy/deploy-generator.js';
import * as helpers from '../../../src/cli/utils/cli-helpers.js';
import * as clack from '@clack/prompts';

// Mock dependencies
vi.mock('../../../src/core/deploy/deploy-generator.js');
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
}));

describe('deployCommand', () => {
    const triggerAction = async () => {
        const action = (deployCommand as any)._actionHandler;
        await action.call(deployCommand, []);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(process, 'cwd').mockReturnValue('/tmp/test-project');
        vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
    });

    it('should generate deploy config for chosen provider', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue({
            projectName: 'my-proj',
            stack: 'nextjs',
            architecture: 'mvc'
        });
        (generator.isProviderSupported as Mock).mockReturnValue(true);
        (clack.select as Mock).mockResolvedValue('vercel');
        (clack.confirm as Mock).mockResolvedValue(true); // Confirmation
        (generator.generateDeploy as Mock).mockResolvedValue({
            copiedFiles: ['vercel.json'],
            instructionsPath: 'DEPLOY.md'
        });

        await triggerAction();

        expect(clack.select).toHaveBeenCalled();
        expect(generator.generateDeploy).toHaveBeenCalledWith('vercel', 'nextjs', '/tmp/test-project', false); // Dockerfile is false for Vercel
    });

    it('should ask about Dockerfile for Railway', async () => {
        (helpers.readProjectConfig as Mock).mockResolvedValue({
            projectName: 'my-proj',
            stack: 'nodejs-express',
            architecture: 'mvc'
        });
        (generator.isProviderSupported as Mock).mockReturnValue(true);
        (clack.select as Mock).mockResolvedValue('railway');
        (clack.confirm as Mock).mockResolvedValueOnce(true); // Include Dockerfile?
        (clack.confirm as Mock).mockResolvedValueOnce(true); // Proceed?
        (generator.generateDeploy as Mock).mockResolvedValue({ copiedFiles: [], instructionsPath: null });

        await triggerAction();

        expect(clack.confirm).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Dockerfile') }));
        expect(generator.generateDeploy).toHaveBeenCalledWith('railway', 'nodejs-express', '/tmp/test-project', true);
    });
});
