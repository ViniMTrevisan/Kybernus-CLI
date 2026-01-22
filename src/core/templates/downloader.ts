import path from 'path';
import fs from 'fs-extra';

const API_URL = process.env.KYBERNUS_API_URL || 'https://kybernus.vercel.app/api';

export interface TemplateFile {
    path: string;
    content: string;
}

export interface DownloadResult {
    success: boolean;
    files?: TemplateFile[];
    error?: string;
}

/**
 * Downloads Pro templates from the Kybernus API
 */
export class TemplateDownloader {

    /**
     * Download Pro template files from API
     */
    async downloadProTemplate(
        licenseKey: string,
        stack: string,
        architecture: string
    ): Promise<DownloadResult> {
        try {
            const response = await fetch(`${API_URL}/templates/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ licenseKey, stack, architecture }),
            });

            const data = await response.json() as any;

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Failed to download template',
                };
            }

            return {
                success: true,
                files: data.files,
            };
        } catch (error: any) {
            return {
                success: false,
                error: `Network error: ${error.message}`,
            };
        }
    }

    /**
     * Write downloaded template files to disk
     */
    async writeTemplateToDisk(
        files: TemplateFile[],
        outputDir: string,
        context: Record<string, any>
    ): Promise<void> {
        for (const file of files) {
            const outputPath = path.join(outputDir, file.path);

            // Ensure directory exists
            await fs.ensureDir(path.dirname(outputPath));

            // Write file content
            await fs.writeFile(outputPath, file.content, 'utf-8');
        }
    }

    /**
     * Cache downloaded templates locally to speed up subsequent uses
     */
    async cacheTemplate(
        stack: string,
        architecture: string,
        files: TemplateFile[]
    ): Promise<void> {
        const cacheDir = path.join(
            process.env.HOME || process.env.USERPROFILE || '.',
            '.kybernus',
            'cache',
            'templates',
            stack,
            'pro',
            architecture
        );

        try {
            await fs.ensureDir(cacheDir);

            for (const file of files) {
                const cachePath = path.join(cacheDir, file.path);
                await fs.ensureDir(path.dirname(cachePath));
                await fs.writeFile(cachePath, file.content, 'utf-8');
            }

            // Write cache timestamp
            await fs.writeFile(
                path.join(cacheDir, '.cache-timestamp'),
                new Date().toISOString(),
                'utf-8'
            );
        } catch (error) {
            // Caching is optional, don't fail if it doesn't work
            console.warn('Failed to cache template:', error);
        }
    }

    /**
     * Check if we have a cached version of the template
     */
    async getCachedTemplate(
        stack: string,
        architecture: string,
        maxAgeHours: number = 24
    ): Promise<string | null> {
        const cacheDir = path.join(
            process.env.HOME || process.env.USERPROFILE || '.',
            '.kybernus',
            'cache',
            'templates',
            stack,
            'pro',
            architecture
        );

        try {
            const timestampPath = path.join(cacheDir, '.cache-timestamp');

            if (!await fs.pathExists(timestampPath)) {
                return null;
            }

            const timestamp = await fs.readFile(timestampPath, 'utf-8');
            const cacheTime = new Date(timestamp);
            const now = new Date();
            const hoursDiff = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);

            if (hoursDiff > maxAgeHours) {
                // Cache expired
                return null;
            }

            return cacheDir;
        } catch (error) {
            return null;
        }
    }
}

export const templateDownloader = new TemplateDownloader();
