import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import fs from 'fs-extra';
import { generateDeploy, isProviderSupported } from '../../../src/core/deploy/deploy-generator.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn(),
        ensureDir: vi.fn(),
        copy: vi.fn(),
    }
}));

describe('deploy-generator', () => {
    const projectRoot = '/tmp/fake-project';

    beforeEach(() => {
        vi.clearAllMocks();
        (fs.pathExists as Mock).mockResolvedValue(true);
        (fs.ensureDir as Mock).mockResolvedValue(true);
        (fs.copy as Mock).mockResolvedValue(true);
    });

    describe('isProviderSupported', () => {
        it('should validate supported combinations', () => {
            expect(isProviderSupported('vercel', 'nextjs')).toBe(true);
            expect(isProviderSupported('railway', 'java-spring')).toBe(true);
        });

        it('should identify unsupported combinations', () => {
            expect(isProviderSupported('vercel', 'java-spring')).toBe(false);
            expect(isProviderSupported('vercel', 'nestjs')).toBe(false);
        });
    });

    describe('generateDeploy', () => {
        it('should copy correct files for Vercel + Next.js', async () => {
            const result = await generateDeploy('vercel', 'nextjs', projectRoot);

            expect(result.copiedFiles).toContain('vercel.json');
            expect(result.copiedFiles).toContain('DEPLOY.md');
            expect(result.copiedFiles).not.toContain('Dockerfile');
        });

        it('should include Dockerfile when requested (Railway)', async () => {
            const result = await generateDeploy('railway', 'nodejs-express', projectRoot, true);

            expect(result.copiedFiles).toContain('railway.toml');
            expect(result.copiedFiles).toContain('Dockerfile');
        });

        it('should NOT include Dockerfile when opted out (Fly.io)', async () => {
            const result = await generateDeploy('fly', 'python-fastapi', projectRoot, false);

            expect(result.copiedFiles).toContain('fly.toml');
            expect(result.copiedFiles).not.toContain('Dockerfile');
        });

        it('should throw error for unknown provider', async () => {
            await expect(generateDeploy('unknown' as any, 'nextjs', projectRoot))
                .rejects.toThrow('Unknown provider');
        });

        it('should throw error for unsupported provider+stack combo', async () => {
            await expect(generateDeploy('vercel', 'java-spring', projectRoot))
                .rejects.toThrow('does not support stack "java-spring"');
        });

        it('should throw error if template is missing', async () => {
            (fs.pathExists as Mock).mockResolvedValue(false);
            await expect(generateDeploy('vercel', 'nextjs', projectRoot))
                .rejects.toThrow('Deploy template not found');
        });
    });
});
