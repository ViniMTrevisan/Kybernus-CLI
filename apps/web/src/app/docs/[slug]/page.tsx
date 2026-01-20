import { getDocBySlug, getAllDocs } from '@/lib/docs';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import DocsLayout from '@/components/DocsLayout';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface DocPageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    const docs = getAllDocs();
    return docs.map((slug) => ({
        slug,
    }));
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const doc = getDocBySlug(resolvedParams.slug);
    if (!doc) return { title: 'Not Found' };

    return {
        title: `${doc.metadata.title || resolvedParams.slug.replace(/_/g, ' ')} | Kybernus Docs`,
        description: doc.metadata.description || 'Kybernus Documentation',
    };
}

export default async function DocPage({ params }: DocPageProps) {
    const resolvedParams = await params;
    const doc = getDocBySlug(resolvedParams.slug);

    if (!doc) {
        notFound();
    }

    return (
        <DocsLayout>
            <div className="max-w-4xl">
                <MarkdownRenderer content={doc.content} />
            </div>
        </DocsLayout>
    );
} 
