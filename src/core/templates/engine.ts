import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { registerHelpers } from './helpers.js';
import { TemplateContext } from '../../models/config.js';

/**
 * Template Engine responsável por renderizar templates Handlebars
 */
export class TemplateEngine {
    private handlebars: typeof Handlebars;

    constructor() {
        this.handlebars = Handlebars.create();
        registerHelpers(this.handlebars);
    }

    /**
     * Renderiza um arquivo de template individual
     */
    async renderFile(templatePath: string, context: TemplateContext): Promise<string> {
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = this.handlebars.compile(templateContent);
        return template(context);
    }

    /**
     * Renderiza uma árvore inteira de templates
     */
    async renderTree(
        templateDir: string,
        outputDir: string,
        context: TemplateContext
    ): Promise<void> {
        const files = await this.getAllTemplateFiles(templateDir);

        for (const file of files) {
            const relativePath = path.relative(templateDir, file);

            // Processa o path com Handlebars (para caminhos dinâmicos como {{packagePath}})
            const processedPath = this.handlebars.compile(relativePath)(context);

            // Remove extensão .hbs
            const finalPath = processedPath.replace(/\.hbs$/, '');

            const outputPath = path.join(outputDir, finalPath);

            // Se for .gitkeep, apenas cria o arquivo vazio
            if (path.basename(file) === '.gitkeep') {
                await fs.ensureDir(path.dirname(outputPath));
                await fs.writeFile(outputPath, '', 'utf-8');
                continue;
            }

            // Renderiza o template
            const content = await this.renderFile(file, context);

            // Skip files that rendered to nothing (e.g. wrapped in {{#if false}})
            if (!content || !content.trim()) {
                continue;
            }

            // Escreve o arquivo
            await fs.ensureDir(path.dirname(outputPath));
            await fs.writeFile(outputPath, content, 'utf-8');

            // Seta permissões para scripts executáveis
            if (this.isExecutableScript(finalPath)) {
                await fs.chmod(outputPath, 0o755);
            }
        }
    }

    /**
     * Busca todos arquivos .hbs e .gitkeep recursivamente
     */
    private async getAllTemplateFiles(dir: string): Promise<string[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files: string[] = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const subFiles = await this.getAllTemplateFiles(fullPath);
                files.push(...subFiles);
            } else if (entry.name.endsWith('.hbs') || entry.name === '.gitkeep') {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Verifica se é um arquivo executável (mvnw, gradlew, etc)
     */
    private isExecutableScript(filePath: string): boolean {
        const basename = path.basename(filePath);
        const executableNames = ['mvnw', 'gradlew'];
        return executableNames.includes(basename);
    }
}
