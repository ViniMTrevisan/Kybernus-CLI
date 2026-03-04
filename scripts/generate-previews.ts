import { ProjectGenerator } from '../src/core/generator/project.js';
import { ProjectConfig, Stack, Architecture } from '../src/models/config.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePreviews() {
    console.log('🚀 Starting Kybernus Preview Generation...');

    const generator = new ProjectGenerator();
    const outputBase = path.join(process.cwd(), 'previews');

    // Clean start
    if (await fs.pathExists(outputBase)) {
        await fs.remove(outputBase);
    }
    await fs.ensureDir(outputBase);

    const stacks: Stack[] = ['nextjs', 'nodejs-express', 'java-spring', 'python-fastapi', 'nestjs', 'n8n'];

    for (const stack of stacks) {
        let archs: Architecture[] = ['mvc', 'clean', 'hexagonal'];

        if (stack === 'nextjs') {
            archs = ['default', 'mvc', 'clean', 'hexagonal'];
        } else if (stack === 'n8n') {
            archs = ['default', 'ai-assistant', 'crm-tracker', 'system-monitor'] as any;
        }

        for (const arch of archs) {
            const projectName = `${stack}-${arch}`;
            const targetDir = path.join(outputBase, stack);

            console.log(`Generating: [${stack}] [${arch}]...`);

            const config: ProjectConfig = {
                projectName: arch, // This will be the folder name inside targetDir
                stack,
                architecture: arch,
                useAI: false,
                buildTool: stack === 'java-spring' ? 'maven' : 'npm',
                packageName: stack === 'java-spring' ? 'com.kybernus.preview' : undefined,
                devops: {
                    docker: true,
                    cicd: true,
                    terraform: true
                }
            };

            try {
                // ProjectGenerator.generate expects outputDir and config.projectName
                // It will create outputDir/config.projectName
                await generator.generate(config, targetDir);
            } catch (err) {
                console.error(`❌ Failed to generate ${projectName}:`, err);
            }
        }
    }

    console.log('\n✅ All previews generated in the "previews/" folder.');
    console.log('📂 Structure: previews/[stack]/[arch]');
}

generatePreviews().catch(console.error);
