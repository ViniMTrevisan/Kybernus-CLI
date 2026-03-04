/**
 * feature-generator.ts
 * 
 * Core engine that copies feature boilerplate files into the user's project.
 *
 * SOLID Design:
 *   - SRP: Each private function has exactly one job:
 *       resolveDestPaths()     → path rewriting for architecture
 *       transformFileContent() → import/package rewriting inside file content  
 *       buildInstallCommand()  → build the install command string for a given stack
 *       installDependencies()  → execute the install command
 *   - OCP: Adding a new architecture or stack only requires adding a new entry
 *       to the ARCH_PATH_RULES or CONTENT_TRANSFORM_RULES tables.
 *   - DIP: `generateFeature` depends on abstractions (config table) not concretions.
 */

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the add-features directory relative to the installed CLI package
const ADD_FEATURES_DIR = path.resolve(__dirname, '../../../add-features');

// ─────────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────────

export type SupportedFeature = 'swagger' | 'redis' | 'websocket' | 'husky' | 'auth';
export type SupportedStack = 'nodejs-express' | 'nestjs' | 'python-fastapi' | 'nextjs' | 'java-spring' | 'n8n';

export interface GenerateFeatureResult {
    copiedFiles: string[];
    instructionsPath: string | null;
    installedDependencies: string[];
}

// ─────────────────────────────────────────────────────────────────
// Private Types
// ─────────────────────────────────────────────────────────────────

interface FeatureFile {
    /** Source file path inside add-features/<feature>/ */
    src: string;
    /** Destination path relative to the project root (MVC default) */
    dest: string;
}

interface FeatureConfig {
    /** Files to copy per stack (or 'all' for stack-agnostic). */
    files: Partial<Record<SupportedStack | 'all', FeatureFile[]>>;
    /** Dependencies to auto-install (npm/pip) per stack. */
    dependencies?: Partial<Record<SupportedStack, string[]>>;
    /** Dev dependencies to auto-install (npm only) per stack. */
    devDependencies?: Partial<Record<SupportedStack, string[]>>;
    /** Stacks that do NOT support this feature */
    unsupported?: SupportedStack[];
}

// ─────────────────────────────────────────────────────────────────
// Feature Map (Data — Open for Extension, Closed for Modification)
// ─────────────────────────────────────────────────────────────────

const FEATURE_MAP: Record<SupportedFeature, FeatureConfig> = {
    swagger: {
        unsupported: ['n8n'],
        files: {
            'nodejs-express': [
                { src: 'swagger/nodejs-express.ts', dest: 'src/swagger.ts' },
                { src: 'swagger/INSTRUCTIONS.md', dest: 'SWAGGER.md' },
            ],
            'nestjs': [
                { src: 'swagger/nestjs.ts', dest: 'src/swagger.ts' },
                { src: 'swagger/INSTRUCTIONS.md', dest: 'SWAGGER.md' },
            ],
            'python-fastapi': [
                { src: 'swagger/python-fastapi.py', dest: 'app/swagger.py' },
                { src: 'swagger/INSTRUCTIONS.md', dest: 'SWAGGER.md' },
            ],
            nextjs: [
                { src: 'swagger/nextjs-swagger.ts', dest: 'src/swagger.ts' },
                { src: 'swagger/nextjs-route.ts', dest: 'src/app/api/docs/route.ts' },
                { src: 'swagger/INSTRUCTIONS.md', dest: 'SWAGGER.md' },
            ],
            'java-spring': [
                { src: 'swagger/java-spring.java', dest: 'src/main/java/config/SwaggerConfig.java' },
                { src: 'swagger/INSTRUCTIONS.md', dest: 'SWAGGER.md' },
            ],
        },
    },

    redis: {
        unsupported: ['n8n'],
        files: {
            'nodejs-express': [
                { src: 'redis/nodejs.ts', dest: 'src/redis.ts' },
                { src: 'redis/docker-compose.snippet.yml', dest: 'docker-compose.redis.yml' },
                { src: 'redis/.env.snippet', dest: '.env.redis' },
                { src: 'redis/INSTRUCTIONS.md', dest: 'REDIS.md' },
            ],
            'nestjs': [
                { src: 'redis/nodejs.ts', dest: 'src/redis.ts' },
                { src: 'redis/docker-compose.snippet.yml', dest: 'docker-compose.redis.yml' },
                { src: 'redis/.env.snippet', dest: '.env.redis' },
                { src: 'redis/INSTRUCTIONS.md', dest: 'REDIS.md' },
            ],
            'python-fastapi': [
                { src: 'redis/python.py', dest: 'app/redis.py' },
                { src: 'redis/docker-compose.snippet.yml', dest: 'docker-compose.redis.yml' },
                { src: 'redis/.env.snippet', dest: '.env.redis' },
                { src: 'redis/INSTRUCTIONS.md', dest: 'REDIS.md' },
            ],
            nextjs: [
                { src: 'redis/nextjs.ts', dest: 'src/lib/redis.ts' },
                { src: 'redis/docker-compose.snippet.yml', dest: 'docker-compose.redis.yml' },
                { src: 'redis/.env.snippet', dest: '.env.redis' },
                { src: 'redis/INSTRUCTIONS.md', dest: 'REDIS.md' },
            ],
            'java-spring': [
                { src: 'redis/java-spring.java', dest: 'src/main/java/config/RedisConfig.java' },
                { src: 'redis/docker-compose.snippet.yml', dest: 'docker-compose.redis.yml' },
                { src: 'redis/.env.snippet', dest: '.env.redis' },
                { src: 'redis/INSTRUCTIONS.md', dest: 'REDIS.md' },
            ],
        },
    },

    websocket: {
        unsupported: ['n8n', 'nextjs'],
        files: {
            'nodejs-express': [
                { src: 'websocket/nodejs-express.ts', dest: 'src/websocket.ts' },
                { src: 'websocket/INSTRUCTIONS.md', dest: 'WEBSOCKET.md' },
            ],
            'nestjs': [
                { src: 'websocket/nestjs.ts', dest: 'src/app.gateway.ts' },
                { src: 'websocket/INSTRUCTIONS.md', dest: 'WEBSOCKET.md' },
            ],
            'python-fastapi': [
                { src: 'websocket/python-fastapi.py', dest: 'app/websocket.py' },
                { src: 'websocket/INSTRUCTIONS.md', dest: 'WEBSOCKET.md' },
            ],
            'java-spring': [
                { src: 'websocket/java-spring.java', dest: 'src/main/java/config/WebSocketConfig.java' },
                { src: 'websocket/INSTRUCTIONS.md', dest: 'WEBSOCKET.md' },
            ],
        },
    },

    husky: {
        // Husky requires npm/package.json — only applies to Node.js stacks
        unsupported: ['java-spring', 'n8n', 'python-fastapi'],
        files: {
            all: [
                { src: 'husky/pre-commit', dest: '.husky/pre-commit' },
                { src: 'husky/commit-msg', dest: '.husky/commit-msg' },
                { src: 'husky/commitlint.config.js', dest: 'commitlint.config.js' },
                { src: 'husky/INSTRUCTIONS.md', dest: 'HUSKY.md' },
            ],
        },
    },

    auth: {
        unsupported: ['n8n'],
        files: {
            'nodejs-express': [
                { src: 'auth/nodejs-express/auth.controller.ts', dest: 'src/auth/auth.controller.ts' },
                { src: 'auth/nodejs-express/auth.service.ts', dest: 'src/auth/auth.service.ts' },
                { src: 'auth/nodejs-express/auth.middleware.ts', dest: 'src/auth/auth.middleware.ts' },
                { src: 'auth/nodejs-express/jwt.config.ts', dest: 'src/auth/jwt.config.ts' },
                { src: 'auth/nodejs-express/auth.routes.ts', dest: 'src/auth/auth.routes.ts' },
                { src: 'auth/nodejs-express/INSTRUCTIONS.md', dest: 'AUTH.md' },
            ],
            'nestjs': [
                { src: 'auth/nestjs/auth.module.ts', dest: 'src/auth/auth.module.ts' },
                { src: 'auth/nestjs/auth.controller.ts', dest: 'src/auth/auth.controller.ts' },
                { src: 'auth/nestjs/auth.service.ts', dest: 'src/auth/auth.service.ts' },
                { src: 'auth/nestjs/jwt.strategy.ts', dest: 'src/auth/jwt.strategy.ts' },
                { src: 'auth/nestjs/jwt-auth.guard.ts', dest: 'src/auth/jwt-auth.guard.ts' },
                { src: 'auth/nestjs/dto/login.dto.ts', dest: 'src/auth/dto/login.dto.ts' },
                { src: 'auth/nestjs/dto/register.dto.ts', dest: 'src/auth/dto/register.dto.ts' },
                { src: 'auth/nestjs/INSTRUCTIONS.md', dest: 'AUTH.md' },
            ],
            'python-fastapi': [
                { src: 'auth/python-fastapi/schemas.py', dest: 'app/auth/schemas.py' },
                { src: 'auth/python-fastapi/security.py', dest: 'app/auth/security.py' },
                { src: 'auth/python-fastapi/service.py', dest: 'app/auth/service.py' },
                { src: 'auth/python-fastapi/router.py', dest: 'app/auth/router.py' },
                { src: 'auth/python-fastapi/INSTRUCTIONS.md', dest: 'AUTH.md' },
            ],
            'java-spring': [
                { src: 'auth/java-spring/AuthController.java', dest: 'src/main/java/auth/AuthController.java' },
                { src: 'auth/java-spring/AuthService.java', dest: 'src/main/java/auth/AuthService.java' },
                { src: 'auth/java-spring/dto/LoginRequest.java', dest: 'src/main/java/auth/dto/LoginRequest.java' },
                { src: 'auth/java-spring/dto/RegisterRequest.java', dest: 'src/main/java/auth/dto/RegisterRequest.java' },
                { src: 'auth/java-spring/security/JwtUtil.java', dest: 'src/main/java/security/JwtUtil.java' },
                { src: 'auth/java-spring/security/JwtRequestFilter.java', dest: 'src/main/java/security/JwtRequestFilter.java' },
                { src: 'auth/java-spring/security/SecurityConfig.java', dest: 'src/main/java/security/SecurityConfig.java' },
                { src: 'auth/java-spring/INSTRUCTIONS.md', dest: 'AUTH.md' },
            ],
            nextjs: [
                { src: 'auth/nextjs/jwt.ts', dest: 'src/lib/auth/jwt.ts' },
                { src: 'auth/nextjs/session.ts', dest: 'src/lib/auth/session.ts' },
                { src: 'auth/nextjs/routes/login.ts', dest: 'src/app/api/auth/login/route.ts' },
                { src: 'auth/nextjs/routes/register.ts', dest: 'src/app/api/auth/register/route.ts' },
                { src: 'auth/nextjs/middleware.ts', dest: 'src/middleware.ts' },
                { src: 'auth/nextjs/INSTRUCTIONS.md', dest: 'AUTH.md' },
            ],
        },
        dependencies: {
            'nodejs-express': ['jsonwebtoken', 'bcryptjs'],
            'nestjs': ['@nestjs/passport', '@nestjs/jwt', 'passport', 'passport-jwt', 'bcryptjs'],
            'python-fastapi': ['python-jose[cryptography]', 'passlib[bcrypt]', 'python-multipart'],
            nextjs: ['jsonwebtoken', 'bcryptjs'],
            // Java: dependencies go in pom.xml — see AUTH.md for the snippets
        },
        devDependencies: {
            'nodejs-express': ['@types/jsonwebtoken', '@types/bcryptjs'],
            'nestjs': ['@types/passport-jwt', '@types/bcryptjs'],
            nextjs: ['@types/jsonwebtoken', '@types/bcryptjs'],
        },
    },
};

// ─────────────────────────────────────────────────────────────────
// Architecture Path Rules (OCP: extend here, not in function)
// ─────────────────────────────────────────────────────────────────

/** Maps MVC default dest prefix → Clean/Hexagonal dest prefix, per stack. */
const ARCH_PATH_RULES: Partial<Record<SupportedStack, [from: string, to: string][]>> = {
    'nodejs-express': [
        ['src/auth/auth.controller.ts', 'src/presentation/controllers/auth.controller.ts'],
        ['src/auth/auth.service.ts', 'src/application/services/auth.service.ts'],
        ['src/auth/auth.middleware.ts', 'src/infrastructure/security/auth.middleware.ts'],
        ['src/auth/jwt.config.ts', 'src/infrastructure/security/jwt.config.ts'],
        ['src/auth/auth.routes.ts', 'src/presentation/routes/auth.routes.ts'],
    ],
    nestjs: [
        ['src/auth/auth.controller.ts', 'src/presentation/controllers/auth.controller.ts'],
        ['src/auth/auth.service.ts', 'src/application/services/auth.service.ts'],
        ['src/auth/auth.middleware.ts', 'src/infrastructure/security/auth.middleware.ts'],
        ['src/auth/jwt.strategy.ts', 'src/infrastructure/security/jwt.strategy.ts'],
        ['src/auth/jwt-auth.guard.ts', 'src/infrastructure/security/jwt-auth.guard.ts'],
        ['src/auth/auth.module.ts', 'src/infrastructure/modules/auth.module.ts'],
        ['src/auth/dto/login.dto.ts', 'src/application/dtos/login.dto.ts'],
        ['src/auth/dto/register.dto.ts', 'src/application/dtos/register.dto.ts'],
    ],
    'python-fastapi': [
        ['app/auth/router.py', 'app/presentation/api/auth_router.py'],
        ['app/auth/service.py', 'app/application/services/auth_service.py'],
        ['app/auth/security.py', 'app/infrastructure/security.py'],
        ['app/auth/schemas.py', 'app/application/schemas/auth_schemas.py'],
    ],
    'java-spring': [
        ['src/main/java/auth/AuthController.java', 'src/main/java/presentation/controllers/AuthController.java'],
        ['src/main/java/auth/AuthService.java', 'src/main/java/application/services/AuthService.java'],
        ['src/main/java/auth/dto/LoginRequest.java', 'src/main/java/application/dtos/LoginRequest.java'],
        ['src/main/java/auth/dto/RegisterRequest.java', 'src/main/java/application/dtos/RegisterRequest.java'],
    ],
};

// ─────────────────────────────────────────────────────────────────
// Content Transform Rules (OCP: extend here, not in function)
// ─────────────────────────────────────────────────────────────────

type TransformRule = { matchDest: string; from: string | RegExp; to: string };

/** Content-level import/package transforms applied when architecture is clean/hexagonal. */
const CONTENT_TRANSFORM_RULES: Partial<Record<SupportedStack, TransformRule[]>> = {
    'nodejs-express': [
        { matchDest: 'presentation/controllers', from: /from '\.\/auth\.service'/g, to: "from '../../application/services/auth.service'" },
        { matchDest: 'presentation/controllers', from: /from '\.\/dto\//g, to: "from '../../application/dtos/" },
        { matchDest: 'presentation/routes', from: /from '\.\/auth\.controller'/g, to: "from '../controllers/auth.controller'" },
        { matchDest: 'presentation/routes', from: /from '\.\/auth\.middleware'/g, to: "from '../../infrastructure/security/auth.middleware'" },
    ],
    nestjs: [
        { matchDest: 'presentation/controllers', from: /from '\.\/auth\.service'/g, to: "from '../../application/services/auth.service'" },
        { matchDest: 'presentation/controllers', from: /from '\.\/dto\//g, to: "from '../../application/dtos/" },
        { matchDest: 'infrastructure/modules', from: /from '\.\/auth\.controller'/g, to: "from '../../presentation/controllers/auth.controller'" },
        { matchDest: 'infrastructure/modules', from: /from '\.\/auth\.service'/g, to: "from '../../application/services/auth.service'" },
        { matchDest: 'infrastructure/modules', from: /from '\.\/jwt\.strategy'/g, to: "from '../security/jwt.strategy'" },
    ],
    'python-fastapi': [
        { matchDest: 'presentation/api', from: 'from .schemas import', to: 'from app.application.schemas.auth_schemas import' },
        { matchDest: 'presentation/api', from: 'from .service import', to: 'from app.application.services.auth_service import' },
        { matchDest: 'presentation/api', from: 'from .security import', to: 'from app.infrastructure.security import' },
    ],
    'java-spring': [
        {
            matchDest: 'presentation/controllers',
            from: 'package com.example.auth;',
            to: 'package presentation.controllers;\n\nimport application.services.AuthService;\nimport application.dtos.RegisterRequest;\nimport application.dtos.LoginRequest;',
        },
        {
            matchDest: 'application/services',
            from: 'package com.example.auth;',
            to: 'package application.services;\n\nimport application.dtos.RegisterRequest;\nimport application.dtos.LoginRequest;',
        },
        {
            matchDest: 'application/dtos',
            from: 'package com.example.auth;',
            to: 'package application.dtos;',
        },
    ],
};

// ─────────────────────────────────────────────────────────────────
// Private Helpers (SRP: each does ONE thing)
// ─────────────────────────────────────────────────────────────────

/**
 * Rewrites the `dest` path of a feature file based on the target architecture.
 * For MVC, it's a no-op. For clean/hexagonal, it applies ARCH_PATH_RULES.
 */
function resolveDestPath(dest: string, stack: SupportedStack, architecture: string): string {
    if (architecture === 'mvc') return dest;

    const rules = ARCH_PATH_RULES[stack];
    if (!rules) return dest;

    for (const [from, to] of rules) {
        if (dest === from) return to;
    }
    return dest;
}

/**
 * Patches file content (imports, package declarations) when files are
 * moved to a clean/hexagonal structure. Applies CONTENT_TRANSFORM_RULES.
 */
function transformFileContent(content: string, stack: SupportedStack, architecture: string, dest: string): string {
    if (architecture === 'mvc') return content;

    const rules = CONTENT_TRANSFORM_RULES[stack];
    if (!rules) return content;

    let result = content;
    for (const rule of rules) {
        if (dest.includes(rule.matchDest)) {
            result = result.replaceAll(rule.from as string, rule.to);
        }
    }
    return result;
}

/**
 * Builds the install command string for the given stack, or null if
 * the stack does not use a CLI package manager for this feature.
 */
function buildInstallCommand(
    stack: SupportedStack,
    deps: string[],
    devDeps: string[]
): string | null {
    if (stack === 'python-fastapi') {
        return deps.length > 0 ? `pip install ${deps.join(' ')}` : null;
    }

    if (['nodejs-express', 'nestjs', 'nextjs', 'n8n'].includes(stack)) {
        const parts: string[] = [];
        if (deps.length > 0) parts.push(`npm install ${deps.join(' ')}`);
        if (devDeps.length > 0) parts.push(`npm install -D ${devDeps.join(' ')}`);
        return parts.length > 0 ? parts.join(' && ') : null;
    }

    return null; // java-spring: managed via pom.xml
}

/**
 * Runs the given install command inside `projectRoot`.
 * Logs a warning (non-fatal) if it fails.
 */
async function installDependencies(
    command: string,
    deps: string[],
    projectRoot: string
): Promise<string[]> {
    try {
        await execAsync(command, { cwd: projectRoot });
        return deps;
    } catch {
        console.warn(`\nWarning: Failed to auto-install dependencies. Run manually:\n  ${command}`);
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

export async function generateFeature(
    feature: SupportedFeature,
    stack: SupportedStack,
    projectRoot: string,
    architecture: string = 'mvc'
): Promise<GenerateFeatureResult> {
    const config = FEATURE_MAP[feature];

    if (!config) {
        throw new Error(`Unknown feature: "${feature}". Supported: ${Object.keys(FEATURE_MAP).join(', ')}`);
    }

    if (config.unsupported?.includes(stack)) {
        throw new Error(`Feature "${feature}" is not supported for stack "${stack}".`);
    }

    const filesToCopy: FeatureFile[] = config.files[stack] ?? config.files['all'] ?? [];

    if (filesToCopy.length === 0) {
        throw new Error(`No files configured for feature "${feature}" with stack "${stack}".`);
    }

    const copiedFiles: string[] = [];
    let instructionsPath: string | null = null;

    for (const file of filesToCopy) {
        const srcPath = path.join(ADD_FEATURES_DIR, file.src);

        if (!await fs.pathExists(srcPath)) {
            throw new Error(`Feature template not found: ${srcPath}`);
        }

        const dest = resolveDestPath(file.dest, stack, architecture);
        const destPath = path.join(projectRoot, dest);

        let content = await fs.readFile(srcPath, 'utf-8');
        content = transformFileContent(content, stack, architecture, dest);

        await fs.ensureDir(path.dirname(destPath));
        await fs.writeFile(destPath, content, 'utf-8');

        copiedFiles.push(dest);

        if (dest.endsWith('.md')) {
            instructionsPath = dest;
        }
    }

    // Dependency installation
    const deps = config.dependencies?.[stack] ?? [];
    const devDeps = config.devDependencies?.[stack] ?? [];
    const command = buildInstallCommand(stack, deps, devDeps);

    const installedDependencies = command
        ? await installDependencies(command, [...deps, ...devDeps], projectRoot)
        : [];

    return { copiedFiles, instructionsPath, installedDependencies };
}

export function isFeatureSupported(feature: SupportedFeature, stack: SupportedStack): boolean {
    const config = FEATURE_MAP[feature];
    return !!config && !config.unsupported?.includes(stack);
}

export function getSupportedFeatures(stack: SupportedStack): SupportedFeature[] {
    return (Object.keys(FEATURE_MAP) as SupportedFeature[]).filter(
        (f) => isFeatureSupported(f, stack)
    );
}
