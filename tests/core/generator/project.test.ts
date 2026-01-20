import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectGenerator } from '../../../src/core/generator/project.js';
import { ProjectConfig } from '../../../src/models/config.js';
import fs from 'fs-extra';
import path from 'path';

// Mock clack prompts
vi.mock('@clack/prompts', () => ({
    spinner: () => ({
        start: vi.fn(),
        stop: vi.fn(),
        message: vi.fn(),
    }),
    log: {
        success: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        message: vi.fn(),
    },
    note: vi.fn(),
}));

// Mock util.promisify to avoid exec issues with maven wrapper logic
vi.mock('util', async () => {
    const actual: any = await vi.importActual('util');
    return {
        ...actual,
        promisify: (fn: any) => async () => 'ok',
    };
});

// Output directory (temp) - Root/test-output
// __dirname is src/tests/core/generator (compiled? TS runs in place?)
// In Vitest with tsx, path resolution should be tested.
// If file is at tests/core/generator/project.test.ts
// ../../../test-output -> project-root/test-output
const OUTPUT_DIR = path.resolve(__dirname, '../../../test-output');

describe('ProjectGenerator Integration', () => {
    let generator: ProjectGenerator;

    beforeEach(async () => {
        vi.clearAllMocks();
        generator = new ProjectGenerator();
        await fs.ensureDir(OUTPUT_DIR);
    });

    afterEach(async () => {
        // Clean up
        await fs.remove(OUTPUT_DIR);
    });

    it('should generate a simple Node.js project using real templates', async () => {
        const config: ProjectConfig = {
            projectName: 'test-node-project',
            licenseKey: 'test-key',
            licenseTier: 'free',
            tier: 'free',
            stack: 'nodejs-express',
            architecture: 'mvc', // Matches templates/nodejs-express/free/mvc
            useAI: false,
        } as any;

        try {
            await generator.generate(config, OUTPUT_DIR);
        } catch (e: any) {
            console.error('Generator error:', e.message);
            throw e;
        }

        const projectPath = path.join(OUTPUT_DIR, 'test-node-project');

        // Assertions
        expect(await fs.pathExists(projectPath)).toBe(true);
        expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
        expect(await fs.pathExists(path.join(projectPath, 'README.md'))).toBe(true);

        // Check content substitution
        const pkg = await fs.readJson(path.join(projectPath, 'package.json'));
        expect(pkg.name).toBe('test-node-project');
    });
});
