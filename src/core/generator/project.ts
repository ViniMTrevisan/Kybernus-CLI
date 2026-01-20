import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as clack from '@clack/prompts';
import { ProjectConfig } from '../../models/config.js';
import { TemplateEngine } from '../templates/engine.js';
import { buildTemplateContext } from './context-builder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

/**
 * Gera projetos a partir de templates
 */
export class ProjectGenerator {
    private engine: TemplateEngine;

    constructor() {
        this.engine = new TemplateEngine();
    }

    /**
     * Gera um projeto completo baseado na configuração
     */
    async generate(config: ProjectConfig, outputDir: string): Promise<void> {
        const spinner = clack.spinner();

        try {
            spinner.start('🏗️  Gerando projeto...');

            // 1. Verifica se diretório já existe
            const projectPath = path.join(outputDir, config.projectName);
            if (await fs.pathExists(projectPath)) {
                spinner.stop('❌ Diretório já existe');
                throw new Error(`Diretório "${config.projectName}" já existe!`);
            }

            // 2. Determina o caminho do template
            const templatePath = this.getTemplatePath(config);

            // Verifica se template existe
            if (!(await fs.pathExists(templatePath))) {
                spinner.stop('❌ Template não encontrado');
                throw new Error(
                    `Template não encontrado: ${config.stack}/${config.licenseTier}\n` +
                    `Path: ${templatePath}`
                );
            }

            // 3. Constrói o context para Handlebars
            const context = buildTemplateContext(config);

            // 4. Renderiza todos os templates
            await this.engine.renderTree(templatePath, projectPath, context);

            // 5. Gera documentação com IA (se habilitado)
            if (config.useAI && config.geminiKey) {
                spinner.message('🤖 Gerando documentação com IA...');
                await this.generateAIDocumentation(config, projectPath);
            }

            // 6. Post-generation hooks (Java wrappers, etc)
            await this.runPostGenerationHooks(config, projectPath);

            spinner.stop('✅ Projeto gerado com sucesso!');

            // 7. Mostra próximos passos
            this.showNextSteps(config);
        } catch (error) {
            spinner.stop('❌ Erro ao gerar projeto');
            throw error;
        }
    }

    /**
     * Gera documentação usando IA (README.md e API.md)
     */
    private async generateAIDocumentation(config: ProjectConfig, projectPath: string): Promise<void> {
        try {
            const { DocumentationGenerator } = await import('../ai/documentation-generator.js');
            const docGen = new DocumentationGenerator(config.geminiKey!);

            // 1. Gera README.md
            try {
                const readme = await docGen.generateREADME(config);
                await fs.writeFile(
                    path.join(projectPath, 'README.md'),
                    readme,
                    'utf-8'
                );
                clack.log.success('  ├─ README.md gerado com IA');
            } catch (error: any) {
                clack.log.warn(`  ├─ Falha ao gerar README: ${error.message}`);
                clack.log.info('  ├─ Usando README do template');
            }

            // 2. Gera API.md (apenas Pro tier com controllers)
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
                        clack.log.success('  └─ API.md gerado com IA');
                    }
                } catch (error: any) {
                    clack.log.warn(`  └─ Falha ao gerar API docs: ${error.message}`);
                }
            }
        } catch (error: any) {
            clack.log.error(`Erro ao gerar documentação com IA: ${error.message}`);
            clack.log.info('Continuando com README do template...');
        }
    }

    /**
     * Retorna o caminho do template baseado na config
     */
    private getTemplatePath(config: ProjectConfig): string {
        // Caminho relativo do generator até a raiz do projeto
        // generator está em src/core/generator/
        // templates está em templates/
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
     * Mostra instruções de próximos passos
     */
    private showNextSteps(config: ProjectConfig): void {
        const instructions = this.getStackSpecificInstructions(config.stack);

        clack.note(
            `📁 Entre no diretório do projeto:\n   cd ${config.projectName}\n\n` +
            `📦 ${instructions.install}\n\n` +
            `🚀 ${instructions.run}\n\n` +
            `📝 Leia o README.md para mais informações`,
            '✨ Próximos passos'
        );
    }

    private getStackSpecificInstructions(stack: string): {
        install: string;
        run: string;
    } {
        switch (stack) {
            case 'nodejs-express':
                return {
                    install: 'Instale as dependências:\n   npm install',
                    run: 'Inicie o servidor:\n   npm run dev',
                };
            case 'nextjs':
                return {
                    install: 'Instale as dependências:\n   npm install',
                    run: 'Inicie o servidor:\n   npm run dev',
                };
            case 'java-spring':
                return {
                    install: 'Build tool configurado (Maven/Gradle)',
                    run: 'Rode a aplicação:\n   ./mvnw spring-boot:run',
                };
            case 'python-fastapi':
                return {
                    install: 'Instale as dependências:\n   pip install -r requirements.txt',
                    run: 'Inicie o servidor:\n   uvicorn main:app --reload',
                };
            case 'nestjs':
                return {
                    install: 'Instale as dependências:\n   npm install',
                    run: 'Inicie o servidor:\n   npm run start:dev',
                };
            default:
                return {
                    install: 'Veja o README.md',
                    run: 'Veja o README.md',
                };
        }
    }

    /**
     * Executa hooks pós-geração (ex: instalar wrappers do Maven/Gradle)
     */
    private async runPostGenerationHooks(config: ProjectConfig, projectPath: string): Promise<void> {
        // Hook específico para Java Spring Boot
        if (config.stack === 'java-spring') {
            await this.installJavaBuildWrapper(config, projectPath);
        }
    }

    /**
     * Instala o build wrapper (Maven ou Gradle) para projetos Java
     */
    private async installJavaBuildWrapper(config: ProjectConfig, projectPath: string): Promise<void> {
        const buildTool = config.buildTool || 'maven';

        try {
            if (buildTool === 'maven') {
                // Usa mvn wrapper:wrapper para gerar os arquivos do wrapper

                // Verifica se Maven está instalado
                try {
                    await execPromise('mvn --version');
                } catch {
                    console.warn('⚠️  Maven não encontrado. Wrapper não será instalado.');
                    console.warn('   Instale Maven ou use o comando: mvn wrapper:wrapper');
                    return;
                }

                // Gera o wrapper
                await execPromise('mvn wrapper:wrapper', { cwd: projectPath });

                // Define permissões de execução no mvnw
                await fs.chmod(path.join(projectPath, 'mvnw'), 0o755);
            } else if (buildTool === 'gradle') {
                // TODO: Implementar Gradle wrapper quando suportarmos Gradle
                console.warn('⚠️  Gradle wrapper ainda não implementado');
            }
        } catch (error) {
            // Não falha a geração do projeto se o wrapper falhar
            console.warn(`⚠️  Erro ao instalar ${buildTool} wrapper:`, error);
            console.warn(`   O projeto foi gerado, mas você precisará instalar o wrapper manualmente.`);
        }
    }

    /**
     * Extrai arquivos de controllers para documentação da API
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
            // Encontra arquivos de controllers recursivamente
            const files = await this.findControllerFiles(fullPath, stack);

            // Lê conteúdo de cada controller (máximo 5 para não sobrecarregar)
            for (const file of files.slice(0, 5)) {
                try {
                    const content = await fs.readFile(file, 'utf-8');
                    const name = path.basename(file);
                    controllers.push({ name, content });
                } catch (error) {
                    // Ignora arquivos que não podem ser lidos
                }
            }
        } catch (error) {
            // Se falhar, retorna array vazio
        }

        return controllers;
    }

    /**
     * Busca arquivos de controllers baseado no stack
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

                    // Inclui apenas arquivos de controllers/routes
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
