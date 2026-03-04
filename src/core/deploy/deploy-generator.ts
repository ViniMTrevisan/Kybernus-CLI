/**
 * deploy-generator.ts
 *
 * Core engine for the `kybernus deploy` command.
 * Mirrors the SOLID design of `feature-generator.ts`.
 *
 * SRP: One function per concern (validate → resolve files → copy).
 * OCP: Adding a new provider or stack only requires a new entry in DEPLOY_MAP.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADD_FEATURES_DIR = path.resolve(__dirname, '../../../add-features');

// ─────────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────────

export type SupportedProvider = 'vercel' | 'railway' | 'fly' | 'render';
export type SupportedStack = 'nodejs-express' | 'nestjs' | 'python-fastapi' | 'nextjs' | 'java-spring';

export interface GenerateDeployResult {
    copiedFiles: string[];
    instructionsPath: string | null;
}

// ─────────────────────────────────────────────────────────────────
// Private Types
// ─────────────────────────────────────────────────────────────────

interface DeployFile {
    src: string;
    dest: string;
}

interface ProviderConfig {
    /** Stacks that this provider does NOT support */
    unsupported?: SupportedStack[];
    /** Files to copy per stack */
    files: Partial<Record<SupportedStack, DeployFile[]>>;
}

// ─────────────────────────────────────────────────────────────────
// Deploy Map
// ─────────────────────────────────────────────────────────────────

const DEPLOY_MAP: Record<SupportedProvider, ProviderConfig> = {
    vercel: {
        // Vercel does not support Java Spring (no JVM runtime)
        unsupported: ['java-spring', 'nestjs'],
        files: {
            'nodejs-express': [
                { src: 'deploy/vercel/nodejs-express.json', dest: 'vercel.json' },
                { src: 'deploy/vercel/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'nextjs': [
                { src: 'deploy/vercel/nextjs.json', dest: 'vercel.json' },
                { src: 'deploy/vercel/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'python-fastapi': [
                { src: 'deploy/vercel/python-fastapi.json', dest: 'vercel.json' },
                { src: 'deploy/vercel/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
        },
    },

    railway: {
        files: {
            'nodejs-express': [
                { src: 'deploy/railway/nodejs.toml', dest: 'railway.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.nodejs', dest: 'Dockerfile' },
                { src: 'deploy/railway/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'nestjs': [
                { src: 'deploy/railway/nodejs.toml', dest: 'railway.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.nodejs', dest: 'Dockerfile' },
                { src: 'deploy/railway/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'nextjs': [
                { src: 'deploy/railway/nextjs.toml', dest: 'railway.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.nextjs', dest: 'Dockerfile' },
                { src: 'deploy/railway/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'python-fastapi': [
                { src: 'deploy/railway/python-fastapi.toml', dest: 'railway.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.python', dest: 'Dockerfile' },
                { src: 'deploy/railway/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'java-spring': [
                { src: 'deploy/railway/java-spring.toml', dest: 'railway.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.java', dest: 'Dockerfile' },
                { src: 'deploy/railway/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
        },
    },

    fly: {
        files: {
            'nodejs-express': [
                { src: 'deploy/fly/nodejs.toml', dest: 'fly.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.nodejs', dest: 'Dockerfile' },
                { src: 'deploy/fly/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'nestjs': [
                { src: 'deploy/fly/nodejs.toml', dest: 'fly.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.nodejs', dest: 'Dockerfile' },
                { src: 'deploy/fly/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'nextjs': [
                { src: 'deploy/fly/nextjs.toml', dest: 'fly.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.nextjs', dest: 'Dockerfile' },
                { src: 'deploy/fly/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'python-fastapi': [
                { src: 'deploy/fly/python-fastapi.toml', dest: 'fly.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.python', dest: 'Dockerfile' },
                { src: 'deploy/fly/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'java-spring': [
                { src: 'deploy/fly/java-spring.toml', dest: 'fly.toml' },
                { src: 'deploy/dockerfiles/Dockerfile.java', dest: 'Dockerfile' },
                { src: 'deploy/fly/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
        },
    },

    render: {
        files: {
            'nodejs-express': [
                { src: 'deploy/render/nodejs.yaml', dest: 'render.yaml' },
                { src: 'deploy/render/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'nestjs': [
                { src: 'deploy/render/nodejs.yaml', dest: 'render.yaml' },
                { src: 'deploy/render/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'nextjs': [
                { src: 'deploy/render/nextjs.yaml', dest: 'render.yaml' },
                { src: 'deploy/render/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'python-fastapi': [
                { src: 'deploy/render/python-fastapi.yaml', dest: 'render.yaml' },
                { src: 'deploy/render/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
            'java-spring': [
                { src: 'deploy/render/java-spring.yaml', dest: 'render.yaml' },
                { src: 'deploy/dockerfiles/Dockerfile.java', dest: 'Dockerfile' },
                { src: 'deploy/render/INSTRUCTIONS.md', dest: 'DEPLOY.md' },
            ],
        },
    },
};

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

export function isProviderSupported(provider: SupportedProvider, stack: SupportedStack): boolean {
    const config = DEPLOY_MAP[provider];
    return !!config && !config.unsupported?.includes(stack) && !!config.files[stack];
}

export async function generateDeploy(
    provider: SupportedProvider,
    stack: SupportedStack,
    projectRoot: string,
    includeDockerfile: boolean = true
): Promise<GenerateDeployResult> {
    const config = DEPLOY_MAP[provider];

    if (!config) {
        throw new Error(`Unknown provider: "${provider}". Supported: ${Object.keys(DEPLOY_MAP).join(', ')}`);
    }

    if (config.unsupported?.includes(stack) || !config.files[stack]) {
        throw new Error(`Provider "${provider}" does not support stack "${stack}".`);
    }

    const filesToCopy = config.files[stack]!.filter(
        (f) => includeDockerfile || f.dest !== 'Dockerfile'
    );
    const copiedFiles: string[] = [];
    let instructionsPath: string | null = null;

    for (const file of filesToCopy) {
        const srcPath = path.join(ADD_FEATURES_DIR, file.src);

        if (!await fs.pathExists(srcPath)) {
            throw new Error(`Deploy template not found: ${srcPath}`);
        }

        const destPath = path.join(projectRoot, file.dest);
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath);

        copiedFiles.push(file.dest);

        if (file.dest.endsWith('.md')) {
            instructionsPath = file.dest;
        }
    }

    return { copiedFiles, instructionsPath };
}
