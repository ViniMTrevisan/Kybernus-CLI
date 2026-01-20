import { GeminiService } from './gemini-service.js';
import { ProjectConfig, Stack } from '../../models/config.js';
import {
    buildREADMEPrompt,
    buildAPIDocsPrompt,
    buildInlineCommentsPrompt,
} from './prompts/documentation-prompts.js';

/**
 * Generator for AI-powered documentation
 */
export class DocumentationGenerator {
    private geminiService: GeminiService;

    constructor(apiKey: string) {
        this.geminiService = new GeminiService(apiKey);
    }

    /**
     * Generate comprehensive README.md
     */
    async generateREADME(config: ProjectConfig): Promise<string> {
        const prompt = buildREADMEPrompt(config);

        try {
            const readme = await this.geminiService.generateWithRetry(prompt);
            return this.cleanMarkdown(readme);
        } catch (error: any) {
            throw new Error(`Failed to generate README: ${error.message}`);
        }
    }

    /**
     * Generate API documentation
     */
    async generateAPIDocumentation(
        stack: Stack,
        controllers: Array<{ name: string; content: string }>
    ): Promise<string> {
        if (controllers.length === 0) {
            return this.getDefaultAPIDocs(stack);
        }

        const prompt = buildAPIDocsPrompt(stack, controllers);

        try {
            const apiDocs = await this.geminiService.generateWithRetry(prompt);
            return this.cleanMarkdown(apiDocs);
        } catch (error: any) {
            throw new Error(`Failed to generate API docs: ${error.message}`);
        }
    }

    /**
     * Add intelligent inline comments to a file
     */
    async addInlineComments(
        content: string,
        language: string,
        filePath: string
    ): Promise<string> {
        const prompt = buildInlineCommentsPrompt(content, language, filePath);

        try {
            const commented = await this.geminiService.generate(prompt);
            return this.extractCodeBlock(commented, language);
        } catch (error: any) {
            // If commenting fails, return original content
            console.warn(`Warning: Failed to add comments to ${filePath}: ${error.message}`);
            return content;
        }
    }

    /**
     * Clean markdown output from AI
     */
    private cleanMarkdown(markdown: string): string {
        // Remove markdown code fences if AI wrapped the output
        let cleaned = markdown.trim();

        // Remove leading ```markdown or ```md
        cleaned = cleaned.replace(/^```(?:markdown|md)?\n/, '');

        // Remove trailing ```
        cleaned = cleaned.replace(/\n```$/, '');

        return cleaned.trim();
    }

    /**
     * Extract code from markdown code block
     */
    private extractCodeBlock(text: string, language: string): string {
        const regex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\\n\`\`\``, 'i');
        const match = text.match(regex);

        if (match && match[1]) {
            return match[1];
        }

        // If no code block found, return original
        return text;
    }

    /**
     * Get default API documentation if generation fails
     */
    private getDefaultAPIDocs(stack: Stack): string {
        return `# API Documentation

            ## Endpoints

            ### Health Check

            \`\`\`
            GET /health
            \`\`\`

            Returns the health status of the application.

            **Response:**
            \`\`\`json
            {
            "status": "healthy"
            }
            \`\`\`

            ---

            **Note**: This is a basic API documentation template. 
            Customize it based on your actual endpoints.

            For more details, refer to the controller files in your project.
            `;
    }
}
