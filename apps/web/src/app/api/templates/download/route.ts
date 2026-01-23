import { NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { rateLimit } from '@/lib/redis';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Allowed stacks and architectures for Pro tier
const ALLOWED_STACKS = ['nodejs-express', 'nextjs', 'java-spring', 'nestjs', 'python-fastapi'];
const ALLOWED_ARCHITECTURES = ['mvc', 'clean', 'hexagonal'];

export async function POST(request: Request) {
    try {
        // Rate limit: 10 downloads per hour per IP
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const rateLimitResult = await rateLimit(`template-download:${ip}`, 10, 3600);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: 'Too many download requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { licenseKey, stack, architecture } = await request.json();

        // Validate input
        if (!licenseKey || !stack || !architecture) {
            return NextResponse.json(
                { error: 'licenseKey, stack, and architecture are required' },
                { status: 400 }
            );
        }

        if (!ALLOWED_STACKS.includes(stack)) {
            return NextResponse.json(
                { error: `Invalid stack: ${stack}` },
                { status: 400 }
            );
        }

        if (!ALLOWED_ARCHITECTURES.includes(architecture)) {
            return NextResponse.json(
                { error: `Invalid architecture: ${architecture}` },
                { status: 400 }
            );
        }

        // Validate license - must be Pro or Trial
        const validation = await licenseService.validate(licenseKey);

        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.message || 'Invalid license' },
                { status: 401 }
            );
        }

        // Check tier - Pro templates require Pro/Trial status
        if (validation.status !== 'PRO_ACTIVE' && validation.status !== 'TRIAL') {
            return NextResponse.json(
                { error: 'Pro templates require an active Pro license or Trial' },
                { status: 403 }
            );
        }

        // Build template path
        // Templates are in monorepo root /templates, not apps/web
        const projectRoot = path.join(process.cwd(), '..', '..');
        const templatesRoot = path.join(projectRoot, 'templates');
        const templatePath = path.join(templatesRoot, stack, 'pro', architecture);

        // Check if template exists
        if (!existsSync(templatePath)) {
            return NextResponse.json(
                { error: `Template not found: ${stack}/pro/${architecture}` },
                { status: 404 }
            );
        }

        // Create ZIP of the template
        const files = await getTemplateFiles(templatePath);

        // Return file list and contents as JSON (for CLI to download)
        return NextResponse.json({
            success: true,
            stack,
            architecture,
            tier: 'pro',
            files,
        });

    } catch (error: any) {
        console.error('Template download error:', error);
        return NextResponse.json(
            { error: 'Failed to download template' },
            { status: 500 }
        );
    }
}

/**
 * Recursively get all files from a template directory
 */
async function getTemplateFiles(dir: string, baseDir?: string): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = [];
    const rootDir = baseDir || dir;

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(rootDir, fullPath);

        if (entry.isDirectory()) {
            // Recurse into subdirectory
            const subFiles = await getTemplateFiles(fullPath, rootDir);
            files.push(...subFiles);
        } else if (entry.isFile()) {
            // Read file content
            const content = await fs.readFile(fullPath, 'utf-8');
            files.push({
                path: relativePath,
                content,
            });
        }
    }

    return files;
}
