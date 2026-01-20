import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_DIRECTORY = path.join(process.cwd(), '../../docs');

export interface DocMetadata {
    title?: string;
    description?: string;
    date?: string;
    [key: string]: any;
}

export interface DocContent {
    slug: string;
    metadata: DocMetadata;
    content: string;
}

export function getAllDocs(): string[] {
    if (!fs.existsSync(DOCS_DIRECTORY)) {
        console.warn(`Docs directory not found at ${DOCS_DIRECTORY}`);
        return [];
    }

    return fs.readdirSync(DOCS_DIRECTORY)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace(/\.md$/, '').toLowerCase());
}

export function getDocBySlug(slug: string): DocContent | null {
    try {
        const allFiles = fs.readdirSync(DOCS_DIRECTORY);
        const fileName = allFiles.find(file =>
            file.toLowerCase() === `${slug.toLowerCase()}.md` ||
            file.toLowerCase().replace(/\.md$/, '') === slug.toLowerCase()
        );

        if (!fileName) return null;

        const fullPath = path.join(DOCS_DIRECTORY, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug: slug.toLowerCase(),
            metadata: data as DocMetadata,
            content,
        };
    } catch (error) {
        console.error(`Error reading doc ${slug}:`, error);
        return null;
    }
}

export function generateTableOfContents(content: string) {
    const headingLines = content.split('\n').filter(line => line.match(/^#{1,3}\s/));

    return headingLines.map(line => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s/, '').trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

        return { level, text, id };
    });
} 
