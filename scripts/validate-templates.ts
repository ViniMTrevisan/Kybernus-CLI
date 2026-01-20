import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProjectGenerator } from '../src/core/generator/project.js';
import { ProjectConfig } from '../src/models/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const TEMP_DIR = path.join(ROOT_DIR, 'temp_validation');

// Mock clack to avoid console spam in non-interactive validation
import * as clack from '@clack/prompts';
// We can't truly mock the import since it's ESM, but ProjectGenerator uses it.
// If it prints to stdout, it's fine.

async function validateTemplates() {
    console.log('🚀 Starting Automated Template Validation...');
    console.log(`📂 Templates Dir: ${TEMPLATES_DIR}`);
    console.log(`📁 Temp Output: ${TEMP_DIR}`);

    await fs.ensureDir(TEMP_DIR);

    // 1. Discover templates
    const stacks = await fs.readdir(TEMPLATES_DIR);
    const failures: string[] = [];
    const successes: string[] = [];
    const skipped: string[] = [];

    for (const stack of stacks) {
        if (stack.startsWith('.')) continue; // .DS_Store

        const stackPath = path.join(TEMPLATES_DIR, stack);
        if (!(await fs.stat(stackPath)).isDirectory()) continue;

        const tiers = await fs.readdir(stackPath);
        for (const tier of tiers) {
            if (tier.startsWith('.')) continue;
            const tierPath = path.join(stackPath, tier);
            if (!(await fs.stat(tierPath)).isDirectory()) continue;

            const archs = await fs.readdir(tierPath);
            for (const arch of archs) {
                if (arch.startsWith('.')) continue;
                const archPath = path.join(tierPath, arch);
                if (!(await fs.stat(archPath)).isDirectory()) continue;

                // Found a template!
                const id = `${stack}/${tier}/${arch}`;
                console.log(`\n---------------------------------------------------`);
                console.log(`🔍 Testing: ${id}`);

                const result = await testTemplate(stack, tier, arch);

                if (result.success) {
                    successes.push(id);
                    console.log(`✅ Passed: ${id}`);
                } else if (result.skipped) {
                    skipped.push(`${id} (${result.reason})`);
                    console.log(`⚠️  Skipped: ${id} - ${result.reason}`);
                } else {
                    failures.push(`${id}: ${result.error}`);
                    console.error(`❌ Failed: ${id} - ${result.error}`);
                }
            }
        }
    }

    // Cleanup
    console.log('\nCleaning up temp directory... (SKIPPED)');
    // await fs.remove(TEMP_DIR);

    // Summary
    console.log('\n\n===================================================');
    console.log('               VALIDATION SUMMARY                  ');
    console.log('===================================================');
    console.log(`✅ Passed:  ${successes.length}`);
    console.log(`⚠️  Skipped: ${skipped.length}`);
    console.log(`❌ Failed:  ${failures.length}`);

    if (failures.length > 0) {
        console.error('\nFailures Details:');
        failures.forEach(f => console.error(` - ${f}`));
        process.exit(1);
    } else {
        console.log('\n✨ All templates validated successfully!');
        process.exit(0);
    }
}

async function testTemplate(stack: string, tier: string, arch: string): Promise<{ success: boolean, skipped?: boolean, reason?: string, error?: string }> {
    const projectName = `val-${stack}-${tier}-${arch}`;
    const projectDir = path.join(TEMP_DIR, projectName);

    try {
        // Clean
        await fs.remove(projectDir);

        // Generate
        const generator = new ProjectGenerator();
        const config: ProjectConfig = {
            projectName,
            stack: stack as any,
            licenseTier: tier as any,
            architecture: arch as any,
            useAI: false,
            packageName: 'com.kybernus.validation',
            buildTool: 'maven' // Default for java
        };

        await generator.generate(config, TEMP_DIR);

        // Install & Build
        const cmds = getBuildCommands(stack);

        if (cmds.length === 0) {
            return { success: true }; // No build logic defined, pass by generation only
        }

        for (const cmd of cmds) {
            console.log(`   Running: ${cmd}`);
            try {
                // Increase maxBuffer to 10MB to handle large build logs
                await execAsync(cmd, { cwd: projectDir, maxBuffer: 1024 * 1024 * 10 });
            } catch (err: any) {
                // Check if command not found (e.g. mvn or python missing)
                if (err.message.includes('command not found') || err.code === 127) {
                    return { success: false, skipped: true, reason: `Tool missing for command: ${cmd}` };
                }
                throw err;
            }
        }

        return { success: true };
    } catch (e: any) {
        const errorDetails = [
            e.message,
            e.stderr ? `\nSTDERR:\n${e.stderr}` : '',
            e.stdout ? `\nSTDOUT:\n${e.stdout}` : ''
        ].filter(Boolean).join('\n');
        return { success: false, error: errorDetails };
    }
}

function getBuildCommands(stack: string): string[] {
    switch (stack) {
        case 'nodejs-express':
        case 'nestjs':
        case 'nextjs':
            // "npm install" takes time.
            return ['npm install --no-audit --no-fund --silent', 'npm run build'];
        case 'java-spring':
            // Use wrapper if exists, else mvn.
            // Generator documentation says it generates 'mvnw'.
            // Linux/Mac: ./mvnw. Win: mvnw.cmd.
            // We are on Mac.
            // Ensure executable permission set by generator? Generator does chmod.
            return ['./mvnw clean package -DskipTests --batch-mode'];
        case 'python-fastapi':
            // Python check
            return ['python3 -m compileall .'];
        default:
            return [];
    }
}

validateTemplates().catch(console.error);
