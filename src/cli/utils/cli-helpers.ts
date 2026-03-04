/**
 * cli-helpers.ts
 * 
 * Shared utilities for Kybernus CLI commands.
 * Follows Single Responsibility and DRY principles.
 * 
 * - All CLI-level repeated logic lives here (reading the rc file,
 *   displaying feature results, handling cancellations, architecture prompts).
 * - No business logic here — only presentation and input handling.
 */

import * as clack from '@clack/prompts';
import color from 'picocolors';
import fs from 'fs-extra';
import path from 'path';
import { SupportedStack, GenerateFeatureResult } from '../../core/features/feature-generator.js';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProjectConfig {
    projectName: string;
    stack: SupportedStack;
    architecture: string;
}

// ─────────────────────────────────────────────────────────────────
// RC File Reader
// ─────────────────────────────────────────────────────────────────

/**
 * Reads `.kybernusrc.json` from `cwd` and returns the parsed project config.
 * Exits the process with a user-friendly error if the file is missing or invalid.
 */
export async function readProjectConfig(cwd: string, { requireExistence = true } = {}): Promise<ProjectConfig | null> {
    const rcPath = path.join(cwd, '.kybernusrc.json');

    if (!fs.existsSync(rcPath)) {
        if (requireExistence) {
            clack.log.error('❌ .kybernusrc.json not found.');
            clack.log.warn('Run this command from the root of a Kybernus-generated project.');
            process.exit(1);
        }
        return null;
    }

    try {
        const raw = JSON.parse(await fs.readFile(rcPath, 'utf8'));
        return {
            projectName: raw.projectName,
            stack: raw.stack,
            architecture: raw.architecture || 'mvc',
        };
    } catch {
        clack.log.error('❌ Failed to parse .kybernusrc.json. Check if it is valid JSON.');
        process.exit(1);
    }
}

// ─────────────────────────────────────────────────────────────────
// Cancellation Guard
// ─────────────────────────────────────────────────────────────────

/**
 * Exits the process gracefully if the user pressed Ctrl+C (clack cancel symbol).
 */
export function exitIfCancelled(value: unknown): void {
    if (clack.isCancel(value)) {
        clack.cancel('Cancelled.');
        process.exit(0);
    }
}

// ─────────────────────────────────────────────────────────────────
// Architecture Prompt
// ─────────────────────────────────────────────────────────────────

/**
 * Prompts the user to select their project's architecture pattern.
 * Used when `.kybernusrc.json` is not available (standalone project).
 */
export async function promptArchitecture(): Promise<string> {
    const selected = await clack.select({
        message: 'What is the architecture pattern of this project?',
        options: [
            { value: 'mvc', label: 'MVC (Classic Controller-Service)' },
            { value: 'clean', label: 'Clean Architecture (Presentation / Application / Infrastructure)' },
            { value: 'hexagonal', label: 'Hexagonal Architecture (Ports and Adapters)' },
        ],
    });

    exitIfCancelled(selected);
    return selected as string;
}

// ─────────────────────────────────────────────────────────────────
// Feature Result Display
// ─────────────────────────────────────────────────────────────────

/**
 * Displays the outcome of a `generateFeature()` call.
 * Single place to change the generated output's UI.
 */
export function displayFeatureResult(result: GenerateFeatureResult): void {
    clack.log.step('Files created:');
    for (const file of result.copiedFiles) {
        clack.log.info(`  ${color.dim('→')} ${file}`);
    }

    if (result.installedDependencies.length > 0) {
        clack.log.step('Dependencies auto-installed:');
        clack.log.info(`  ${color.dim('📦')} ${color.blue(result.installedDependencies.join(', '))}`);
    }

    if (result.instructionsPath) {
        clack.log.step(`📖 Integration guide: ${color.yellow(result.instructionsPath)}`);
    }
}

// ─────────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────────

/**
 * Uniform error handler for feature generation failures.
 */
export function handleGenerateError(err: unknown, spinner: ReturnType<typeof clack.spinner>): never {
    spinner.stop();
    clack.log.error(`❌ ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
}
