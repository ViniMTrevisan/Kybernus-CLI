import { describe, it, expect, beforeEach, vi, afterEach, Mock } from 'vitest';
import { initCommand } from '../../../src/cli/commands/init.js';
import { runWizard } from '../../../src/cli/prompts/wizard.js';
import { ProjectGenerator } from '../../../src/core/generator/project.js';
import { AnalyticsClient } from '../../../src/cli/services/AnalyticsClient.js';

// Mock dependecies
vi.mock('../../../src/cli/prompts/wizard.js');
vi.mock('../../../src/core/generator/project.js');
vi.mock('../../../src/cli/services/AnalyticsClient.js');
vi.mock('@clack/prompts', () => ({
    outro: vi.fn(),
}));

describe('initCommand E2E Flow', () => {
    let mockGenerate: any;
    let mockTrack: any;

    beforeEach(() => {
        vi.restoreAllMocks(); // Clear previous spies

        // Generator Mock
        mockGenerate = vi.fn().mockImplementation(async () => { });
        // Ensure ProjectGenerator behaves as a constructor
        (ProjectGenerator as unknown as Mock).mockImplementation(function () {
            return { generate: mockGenerate };
        });

        // Analytics Mock
        mockTrack = vi.fn().mockImplementation(async () => { });
        (AnalyticsClient as unknown as Mock).mockImplementation(function () {
            return { track: mockTrack };
        });

        vi.spyOn(process, 'cwd').mockReturnValue('/tmp/test-cwd');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should generate a project successfully', async () => {
        (runWizard as Mock).mockResolvedValue({
            projectName: 'open-source-proj',
            stack: 'nodejs-express',
            useAI: false
        });

        await initCommand({});

        expect(runWizard).toHaveBeenCalled();
        expect(mockGenerate).toHaveBeenCalled();
        expect(mockTrack).toHaveBeenCalledWith('project_generated', expect.objectContaining({ tier: 'opensource' }));
    });
});
