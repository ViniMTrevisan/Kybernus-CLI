import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as clack from '@clack/prompts';
import { ProjectConfig } from '../../models/config.js';
import { TemplateEngine } from '../templates/engine.js';
import { buildTemplateContext } from './context-builder.js';
import { templateDownloader } from '../templates/downloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

/**
 * Generates projects from templates
 */
export class ProjectGenerator {
    private engine: TemplateEngine;

    constructor() {
        this.engine = new TemplateEngine();
    }

    /**
     * Generates a complete project based on configuration
     */
    async generate(config: ProjectConfig, outputDir: string): Promise<void> {
        const spinner = clack.spinner();

        try {
            spinner.start('🏗️  Gerando projeto...');

            // 1. Check if directory already exists
            const projectPath = path.join(outputDir, config.projectName);
            if (await fs.pathExists(projectPath)) {
                spinner.stop('❌ Directory already exists');
                throw new Error(`Directory "${config.projectName}" already exists!`);
            }

            // 2. Determine template path based on ARCHITECTURE tier, not user tier
            // Pro users can generate Free templates (e.g. MVC)
            let templatePath: string;

            // Check if this architecture requires Pro (clean/hexagonal)
            const isProArchitecture = config.architecture === 'clean' || config.architecture === 'hexagonal';

            if (isProArchitecture && config.licenseTier === 'pro') {
                // Pro-only architectures: download from API
                spinner.message('📦 Checking Pro templates...');
                templatePath = await this.getProTemplatePath(config, spinner);
            } else if (isProArchitecture && config.licenseTier !== 'pro') {
                // User tried to access Pro architecture without Pro license
                spinner.stop('❌ Pro license required');
                throw new Error(`Architecture "${config.architecture}" requires a Pro license. Use "kybernus upgrade" to unlock.`);
            } else {
                // Free/Architect architectures (MVC, default): use local bundled templates
                templatePath = this.getLocalTemplatePath(config);
            }

            // Check if template exists
            if (!(await fs.pathExists(templatePath))) {
                spinner.stop('❌ Template not found');
                throw new Error(
                    `Template not found: ${config.stack}/${config.licenseTier}\n` +
                    `Path: ${templatePath}`
                );
            }

            // 3. Build context for Handlebars
            const context = buildTemplateContext(config);

            // 4. Render all templates
            await this.engine.renderTree(templatePath, projectPath, context);

            // 5. Generate AI documentation (if enabled)
            if (config.useAI && config.geminiKey) {
                spinner.message('🤖 Generating AI documentation...');
                await this.generateAIDocumentation(config, projectPath);
            }

            // 6. Post-generation hooks (Java wrappers, etc)
            await this.runPostGenerationHooks(config, projectPath);

            spinner.stop('✅ Project generated successfully!');

            // 7. Show next steps
            this.showNextSteps(config);
        } catch (error) {
            spinner.stop('❌ Error generating project');
            throw error;
        }
    }

    /**
     * Get Pro template path - downloads from API if not cached
     */
    private async getProTemplatePath(config: ProjectConfig, spinner: ReturnType<typeof clack.spinner>): Promise<string> {
        const architecture = config.architecture || 'clean';

        // Check cache first
        const cachedPath = await templateDownloader.getCachedTemplate(config.stack, architecture);
        if (cachedPath) {
            return cachedPath;
        }

        // Download from API
        spinner.message('⬇️  Downloading Pro templates...');

        const result = await templateDownloader.downloadProTemplate(
            config.licenseKey!,
            config.stack,
            architecture
        );

        if (!result.success || !result.files) {
            throw new Error(result.error || 'Failed to download Pro template');
        }

        // Cache the downloaded template
        await templateDownloader.cacheTemplate(config.stack, architecture, result.files);

        // Return cache path
        return await templateDownloader.getCachedTemplate(config.stack, architecture) || '';
    }

    /**
     * Get local template path for Free tier (bundled with npm package)
     */
    private getLocalTemplatePath(config: ProjectConfig): string {
        const templatesRoot = path.join(__dirname, '../../../templates');

        // Next.js uses 'default' architecture, others use 'mvc'
        const architecture = config.architecture || (config.stack === 'nextjs' ? 'default' : 'mvc');

        return path.join(templatesRoot, config.stack, 'free', architecture);
    }

    /**
     * Generates documentation using AI (README.md and API.md)
     */
    private async generateAIDocumentation(config: ProjectConfig, projectPath: string): Promise<void> {
        try {
            const { DocumentationGenerator } = await import('../ai/documentation-generator.js');
            const docGen = new DocumentationGenerator(config.geminiKey!);

            // 1. Generate README.md
            try {
                const readme = await docGen.generateREADME(config);
                await fs.writeFile(
                    path.join(projectPath, 'README.md'),
                    readme,
                    'utf-8'
                );
                clack.log.success('  ├─ README.md generated with AI');
            } catch (error: any) {
                clack.log.warn(`  ├─ Failed to generate README: ${error.message}`);
                clack.log.info('  ├─ Using template README');
            }

            // 2. Generate API.md (Pro tier only with controllers)
            if (config.licenseTier === 'pro') {
                try {
                    const controllers = await this.extractControllers(projectPath, config.stack);

                    if (controllers.length > 0) {
                        const apiDocs = await docGen.generateAPIDocumentation(config.stack, controllers);
                        await fs.writeFile(
                            path.join(projectPath, 'API.md'),
                            apiDocs,
                            'utf-8'
                        );
                        clack.log.success('  └─ API.md generated with AI');
                    }
                } catch (error: any) {
                    clack.log.warn(`  └─ Failed to generate API docs: ${error.message}`);
                }
            }
        } catch (error: any) {
            clack.log.error(`Error generating AI documentation: ${error.message}`);
            clack.log.info('Continuing with template README...');
        }
    }

    /**
     * Returns template path based on config
     */
    private getTemplatePath(config: ProjectConfig): string {
        // Relative path from generator to project root
        // generator is in src/core/generator/
        // templates is in templates/
        const templatesRoot = path.join(__dirname, '../../../templates');

        const tier = config.licenseTier;
        const stack = config.stack;

        // For stacks that support architectures (backend stacks)
        // Path: templates/<stack>/<tier>/<architecture>
        // For stacks without architecture (e.g., nextjs)
        // Path: templates/<stack>/<tier>/default
        const architecture = config.architecture || 'default';

        return path.join(templatesRoot, stack, tier, architecture);
    }

    /**
     * Shows next steps instructions
     */
    private showNextSteps(config: ProjectConfig): void {
        const instructions = this.getStackSpecificInstructions(config.stack);

        clack.note(
            `📁 Enter the project directory:\n   cd ${config.projectName}\n\n` +
            `📦 ${instructions.install}\n\n` +
            `🚀 ${instructions.run}\n\n` +
            `📝 Read README.md for more information`,
            '✨ Next steps'
        );
    }

    private getStackSpecificInstructions(stack: string): {
        install: string;
        run: string;
    } {
        switch (stack) {
            case 'nodejs-express':
                return {
                    install: 'Install the dependencies:\n   npm install',
                    run: 'Start the server:\n   npm run dev',
                };
            case 'nextjs':
                return {
                    install: 'Install the dependencies:\n   npm install',
                    run: 'Start the server:\n   npm run dev',
                };
            case 'java-spring':
                return {
                    install: 'Build tool configurado (Maven/Gradle)',
                    run: 'Run the application:\n   ./mvnw spring-boot:run',
                };
            case 'python-fastapi':
                return {
                    install: 'Install dependencies:\n   pip install -r requirements.txt',
                    run: 'Start the server:\n   uvicorn main:app --reload',
                };
            case 'nestjs':
                return {
                    install: 'Install dependencies:\n   npm install',
                    run: 'Start the server:\n   npm run start:dev',
                };
            default:
                return {
                    install: 'See README.md',
                    run: 'See README.md',
                };
        }
    }

    /**
     * Runs post-generation hooks (e.g., install Maven/Gradle wrappers)
     */
    private async runPostGenerationHooks(config: ProjectConfig, projectPath: string): Promise<void> {
        // Java Spring Boot specific hook
        if (config.stack === 'java-spring') {
            await this.installJavaBuildWrapper(config, projectPath);
        }
    }

    /**
     * Installs build wrapper (Maven or Gradle) for Java projects
     */
    private async installJavaBuildWrapper(config: ProjectConfig, projectPath: string): Promise<void> {
        const buildTool = config.buildTool || 'maven';

        try {
            if (buildTool === 'maven') {
                // Use mvn wrapper:wrapper to generate wrapper files

                // Check if Maven is installed
                try {
                    await execPromise('mvn --version');
                } catch {
                    console.warn('⚠️  Maven not found. Wrapper will not be installed.');
                    console.warn('   Instale Maven ou use o comando: mvn wrapper:wrapper');
                    return;
                }

                // Generate wrapper
                await execPromise('mvn wrapper:wrapper', { cwd: projectPath });

                // Set execution permissions on mvnw
                await fs.chmod(path.join(projectPath, 'mvnw'), 0o755);
            } else if (buildTool === 'gradle') {
                // TODO: Implement Gradle wrapper when we support Gradle
                console.warn('⚠️  Gradle wrapper not yet implemented');
            }
        } catch (error) {
            // Don't fail project generation if wrapper fails
            console.warn(`⚠️  Erro ao instalar ${buildTool} wrapper:`, error);
            console.warn(`   Project was generated, but you will need to install the wrapper manually.`);
        }
    }

    /**
     * Extracts controller files for API documentation
     */
    private async extractControllers(projectPath: string, stack: string): Promise<Array<{ name: string, content: string }>> {
        const controllers: Array<{ name: string, content: string }> = [];

        const controllerPaths: Record<string, string> = {
            'nodejs-express': 'src/controllers',
            'nestjs': 'src',
            'python-fastapi': 'app/controllers',
            'java-spring': 'src/main/java',
            'nextjs': 'src/app/api',
        };

        const controllerDir = controllerPaths[stack];
        if (!controllerDir) return controllers;

        const fullPath = path.join(projectPath, controllerDir);
        if (!(await fs.pathExists(fullPath))) return controllers;

        try {
            // Find controller files recursively
            const files = await this.findControllerFiles(fullPath, stack);

            // Read content of each controller (max 5 to avoid overload)
            for (const file of files.slice(0, 5)) {
                try {
                    const content = await fs.readFile(file, 'utf-8');
                    const name = path.basename(file);
                    controllers.push({ name, content });
                } catch (error) {
                    // Ignore files that can't be read
                }
            }
        } catch (error) {
            // If it fails, return empty array
        }

        return controllers;
    }

    /**
     * Searches for controller files based on stack
     */
    private async findControllerFiles(dir: string, stack: string): Promise<string[]> {
        const extensions: Record<string, string[]> = {
            'nodejs-express': ['.ts', '.js'],
            'nestjs': ['.ts'],
            'python-fastapi': ['.py'],
            'java-spring': ['.java'],
            'nextjs': ['.ts', '.tsx'],
        };

        const validExts = extensions[stack] || [];
        const files: string[] = [];

        const scan = async (currentDir: string) => {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    // Ignora node_modules, dist, etc
                    if (!['node_modules', 'dist', 'build', '__pycache__'].includes(entry.name)) {
                        await scan(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    const name = entry.name.toLowerCase();

                    // Include only controller/route files
                    if (validExts.includes(ext) &&
                        (name.includes('controller') || name.includes('route') ||
                            name.includes('auth') || name.includes('payment'))) {
                        files.push(fullPath);
                    }
                }
            }
        };

        await scan(dir);
        return files;
    }
}
