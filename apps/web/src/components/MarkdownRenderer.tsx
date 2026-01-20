"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-invert prose-blue max-w-none prose-pre:bg-transparent prose-pre:p-0">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <div className="relative group my-6">
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 border-b border-border rounded-t-lg">
                                        <span className="text-xs font-mono text-muted-foreground uppercase">{match[1]}</span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(String(children))}
                                            className="text-xs text-muted-foreground hover:text-cyber-blue transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <SyntaxHighlighter
                                        style={atomDark}
                                        language={match[1]}
                                        PreTag="div"
                                        className="!m-0 !rounded-t-none !rounded-b-lg !bg-secondary/40 border-x border-b border-border"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        ) : (
                            <code className={`${className} bg-secondary/50 px-1.5 py-0.5 rounded text-cyber-blue font-mono text-sm`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    h1: ({ children }) => (
                        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mt-16 mb-6 border-b border-border pb-2 flex items-center gap-2 group">
                            <span className="text-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity">#</span>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-medium mt-8 mb-4 text-white/90">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="text-muted-foreground leading-7 mb-6">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="space-y-3 mb-6 list-none p-0">
                            {children}
                        </ul>
                    ),
                    li: ({ children }) => (
                        <li className="flex items-start gap-3 text-muted-foreground">
                            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-cyber-blue/40 shrink-0" />
                            <span>{children}</span>
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-cyber-blue/50 bg-cyber-blue/5 p-6 rounded-r-lg italic my-8">
                            {children}
                        </blockquote>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-8 rounded-lg border border-border">
                            <table className="w-full text-sm text-left">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="px-6 py-3 bg-secondary/50 font-semibold text-white border-b border-border">
                            {children}
                        </th>
                    ),
                    td({ children }: any) {
                        return (
                            <td className="px-6 py-4 border-b border-border font-normal text-muted-foreground">
                                {children}
                            </td>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
