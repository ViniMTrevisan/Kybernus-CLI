import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs-extra';
import { exec } from 'node:child_process';
import { generateFeature, isFeatureSupported } from '../../../src/core/features/feature-generator.js';

// 1. Mock fs-extra with the default export structure it expects
vi.mock('fs-extra', () => ({
    default: {
        pathExists: vi.fn(),
        readFile: vi.fn(),
        ensureDir: vi.fn(),
        writeFile: vi.fn(),
    }
}));

// 2. Mock child_process exec
vi.mock('node:child_process', () => ({
    exec: vi.fn((cmd, options, callback) => {
        if (typeof options === 'function') {
            options(null, { stdout: 'ok', stderr: '' });
        } else if (callback) {
            callback(null, { stdout: 'ok', stderr: '' });
        }
    }),
}));

// 3. Create typed mock references to avoid manual casting everywhere
const mockedFs = vi.mocked(fs);
const mockedExec = vi.mocked(exec);

describe('feature-generator', () => {
    const projectRoot = '/tmp/fake-project';

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock behaviors using the typed references
        mockedFs.pathExists.mockResolvedValue(true as never);
        mockedFs.readFile.mockResolvedValue('original content from "./auth.service"' as never);
        mockedFs.ensureDir.mockResolvedValue(undefined as never);
        mockedFs.writeFile.mockResolvedValue(undefined as never);
    });

    describe('isFeatureSupported', () => {
        it('should return true for supported combinations', () => {
            expect(isFeatureSupported('auth', 'nodejs-express')).toBe(true);
            expect(isFeatureSupported('swagger', 'nestjs')).toBe(true);
        });

        it('should return false for unsupported combinations', () => {
            expect(isFeatureSupported('husky', 'java-spring')).toBe(false);
            expect(isFeatureSupported('auth', 'n8n' as any)).toBe(false);
        });
    });

    describe('generateFeature - MVC (Default)', () => {
        it('should copy files to default MVC paths', async () => {
            const result = await generateFeature('auth', 'nodejs-express', projectRoot, 'mvc');

            expect(result.copiedFiles).toContain('src/auth/auth.controller.ts');
            expect(result.copiedFiles).toContain('src/auth/auth.service.ts');

            expect(mockedFs.writeFile).toHaveBeenCalledWith(
                expect.stringContaining('src/auth/auth.controller.ts'),
                expect.stringContaining('original content'),
                'utf-8'
            );
        });

        it('should attempt to install dependencies', async () => {
            const result = await generateFeature('auth', 'nodejs-express', projectRoot, 'mvc');
            expect(result.installedDependencies).toEqual(['jsonwebtoken', 'bcryptjs', '@types/jsonwebtoken', '@types/bcryptjs']);
        });
    });

    describe('generateFeature - Clean Architecture (Transformation)', () => {
        it('should redirect paths according to ARCH_PATH_RULES', async () => {
            const result = await generateFeature('auth', 'nodejs-express', projectRoot, 'clean');

            expect(result.copiedFiles).toContain('src/presentation/controllers/auth.controller.ts');
            expect(result.copiedFiles).not.toContain('src/auth/auth.controller.ts');
        });

        it('should transform content according to CONTENT_TRANSFORM_RULES', async () => {
            mockedFs.readFile.mockResolvedValue("import { AuthService } from './auth.service'" as never);

            await generateFeature('auth', 'nodejs-express', projectRoot, 'clean');

            const writeFileCall = mockedFs.writeFile.mock.calls.find(call =>
                (call[0] as string).includes('src/presentation/controllers/auth.controller.ts')
            );

            expect(writeFileCall).toBeDefined();
            expect(writeFileCall![1]).toContain("../../application/services/auth.service");
        });
    });

    describe('Edge Cases & Error Handling', () => {
        it('should throw error for unknown feature', async () => {
            await expect(generateFeature('unknown' as any, 'nodejs-express', projectRoot))
                .rejects.toThrow('Unknown feature');
        });

        it('should throw error for unsupported stack', async () => {
            await expect(generateFeature('husky', 'java-spring' as any, projectRoot))
                .rejects.toThrow('is not supported for stack "java-spring"');
        });

        it('should throw error if template file is missing', async () => {
            mockedFs.pathExists.mockResolvedValue(false as never);
            await expect(generateFeature('auth', 'nodejs-express', projectRoot))
                .rejects.toThrow('Feature template not found');
        });

        it('should return empty installedDependencies if exec fails', async () => {
            mockedExec.mockImplementation((cmd, opt, cb: any) => {
                const callback = typeof opt === 'function' ? opt : cb;
                callback(new Error('fail'), { stdout: '', stderr: 'error' });
                return {} as any;
            });

            const result = await generateFeature('auth', 'nodejs-express', projectRoot);
            expect(result.installedDependencies).toEqual([]);
        });
    });
});